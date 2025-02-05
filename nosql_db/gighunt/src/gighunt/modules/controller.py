# API Router documentation: https://fastapi.tiangolo.com/reference/apirouter/

import json
import logging
from fastapi import APIRouter, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse

from gighunt.modules.application import Application
from gighunt.routers.announcement_router import AnnouncementRouter
from gighunt.routers.group_router import GroupRouter
from gighunt.routers.place_router import PlaceRouter
from gighunt.routers.user_router import UserRouter


class Controller:
    def __init__(self, application: Application) -> None:
        self._logger = logging.getLogger(__name__)
        self._application = application
        self._router = APIRouter()
        self._user_router = UserRouter(self._router, self._application.user_use_cases)
        self._announcement_router = AnnouncementRouter(
            self._router, self._application.announcement_use_cases
        )
        self._group_router = GroupRouter(
            self._router, self._application.group_use_cases
        )
        self._place_router = PlaceRouter(
            self._router, self._application.place_use_cases
        )
        self._router.add_api_route("/", self.root, methods=["GET"])
        self._router.add_api_route(
            "/api/import_data", self._import_data, methods=["POST"]
        )
        self._router.add_api_route(
            "/api/export_data", self._export_data, methods=["GET"]
        )
        self._router.add_api_route(
            "/api/get_total_stats", self._get_total_stats, methods=["GET"], tags=["Stats"]
        )

        self.__fill_data_with_start_graph()

    def __fill_data_with_start_graph(self) -> None:
        start_graph_path = "src/gighunt/dump/start_graph.json"
        try:
            with open(start_graph_path, "r", encoding="utf-8") as file:
                data = json.load(file)
                self._set_dump(data)
                self._logger.info(f"Filled the graph successfully upon startup!")
        except (IOError, TypeError) as err:
            self._logger.error(f"Failed to fill the graph upon startup: {err}")

    @property
    def router(self) -> APIRouter:
        return self._router

    async def root(self) -> Response:
        return {"message": "Hello, World! It's Gighunt!"}

    def _set_dump(self, graph_data) -> None:
        static = graph_data.get("static", [])
        vertices = graph_data.get("vertices", [])
        edges = graph_data.get("edges", [])

        # Vertices
        users = vertices["users"]
        groups = vertices["groups"]
        announcements = vertices["announcements"]
        places = vertices["places"]

        # Edges
        user_groups = edges["users"]["groups"]
        stars_to_users = edges["stars"]["users"]
        stars_to_groups = edges["stars"]["groups"]
        stars_to_announcements = edges["stars"]["announcements"]
        comments_to_announcements = edges["comments"]["announcements"]
        producer_announcements_from_users = edges["producer_announcements"]["users"]
        producer_announcements_from_groups = edges["producer_announcements"][
            "groups"
        ]

        # Clear graph
        # Static
        self._application.user_use_cases.get_static_collection().truncate()

        # Vertices
        self._application.user_use_cases.clear()
        self._application.group_use_cases.clear()
        self._application.announcement_use_cases.clear()
        self._application.place_use_cases.clear()

        # Edges
        self._application.edges_use_cases.user_group_use_cases.clear()
        self._application.edges_use_cases.stars_use_cases.clear()
        self._application.edges_use_cases.comment_use_cases.clear()
        self._application.edges_use_cases.producer_announcement_use_cases.clear()

        # Fill graph with new data
        # Static
        self._application.user_use_cases.get_static_collection().insert(static[0])

        # Vertices
        for user in users:
            self._application.user_use_cases.insert_json_vertex(user)
        for group in groups:
            self._application.group_use_cases.insert_json_vertex(group)
        for announcement in announcements:
            self._application.announcement_use_cases.insert_json_vertex(
                announcement
            )
        for place in places:
            self._application.place_use_cases.insert_json_vertex(place)

        # Edges
        for user_group in user_groups:
            self._application.edges_use_cases.user_group_use_cases.insert_json_edge(
                self._application.edges_use_cases.user_group_use_cases.edge_collection_names.USERGROUP.value,
                user_group,
            )
        for stars_to_user in stars_to_users:
            self._application.edges_use_cases.stars_use_cases.insert_json_edge(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOUSER.value,
                stars_to_user,
            )
        for stars_to_group in stars_to_groups:
            self._application.edges_use_cases.stars_use_cases.insert_json_edge(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOGROUP.value,
                stars_to_group,
            )
        for stars_to_announcement in stars_to_announcements:
            self._application.edges_use_cases.stars_use_cases.insert_json_edge(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value,
                stars_to_announcement,
            )
        for comments_to_announcement in comments_to_announcements:
            self._application.edges_use_cases.comment_use_cases.insert_json_edge(
                self._application.edges_use_cases.comment_use_cases.edge_collection_names.COMMENTTOANNOUNCEMENT.value,
                comments_to_announcement,
            )
        for producer_announcements_from_user in producer_announcements_from_users:
            self._application.edges_use_cases.producer_announcement_use_cases.insert_json_edge(
                self._application.edges_use_cases.producer_announcement_use_cases.edge_collection_names.ANNOUNCEMENTFROMUSER.value,
                producer_announcements_from_user,
            )
        for producer_announcements_from_group in producer_announcements_from_groups:
            self._application.edges_use_cases.producer_announcement_use_cases.insert_json_edge(
                self._application.edges_use_cases.producer_announcement_use_cases.edge_collection_names.ANNOUNCEMENTFROMGROUP.value,
                producer_announcements_from_group,
            )

    def _get_dump(self) -> dict:
        # Static
        static = list(self._application.user_use_cases.get_static_collection().all())

        # Vertices
        users = list(self._application.user_use_cases.get_all_entities().all())
        groups = list(self._application.group_use_cases.get_all_entities().all())
        announcements = list(
            self._application.announcement_use_cases.get_all_entities().all()
        )
        places = list(self._application.place_use_cases.get_all_entities().all())

        # Edges
        users_groups = list(
            self._application.edges_use_cases.user_group_use_cases.get_all_entities(
                self._application.edges_use_cases.user_group_use_cases.edge_collection_names.USERGROUP.value
            ).all()
        )
        stars_to_users = list(
            self._application.edges_use_cases.stars_use_cases.get_all_entities(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOUSER.value
            ).all()
        )
        stars_to_groups = list(
            self._application.edges_use_cases.stars_use_cases.get_all_entities(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOGROUP.value
            ).all()
        )
        stars_to_announcement = list(
            self._application.edges_use_cases.stars_use_cases.get_all_entities(
                self._application.edges_use_cases.stars_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value
            ).all()
        )
        comments_to_announcements = list(
            self._application.edges_use_cases.comment_use_cases.get_all_entities(
                self._application.edges_use_cases.comment_use_cases.edge_collection_names.COMMENTTOANNOUNCEMENT.value
            ).all()
        )
        producer_announcements_from_users = list(
            self._application.edges_use_cases.producer_announcement_use_cases.get_all_entities(
                self._application.edges_use_cases.producer_announcement_use_cases.edge_collection_names.ANNOUNCEMENTFROMUSER.value
            ).all()
        )
        producer_announcements_from_groups = list(
            self._application.edges_use_cases.producer_announcement_use_cases.get_all_entities(
                self._application.edges_use_cases.producer_announcement_use_cases.edge_collection_names.ANNOUNCEMENTFROMGROUP.value
            ).all()
        )

        graph_data = {
            "static": static,
            "vertices": {
                "users": users,
                "groups": groups,
                "announcements": announcements,
                "places": places,
            },
            "edges": {
                "users": {
                    "groups": users_groups,
                },
                "stars": {
                    "users": stars_to_users,
                    "groups": stars_to_groups,
                    "announcements": stars_to_announcement,
                },
                "comments": {
                    "announcements": comments_to_announcements,
                },
                "producer_announcements": {
                    "users": producer_announcements_from_users,
                    "groups": producer_announcements_from_groups,
                },
            },
        }

        return graph_data

    def _count_imported_records(self, graph_data) -> int:
        static = graph_data.get("static", [])
        vertices = graph_data.get("vertices", [])
        edges = graph_data.get("edges", [])

        # Vertices
        users = vertices["users"]
        groups = vertices["groups"]
        announcements = vertices["announcements"]
        places = vertices["places"]

        # Edges
        user_groups = edges["users"]["groups"]
        stars_to_users = edges["stars"]["users"]
        stars_to_groups = edges["stars"]["groups"]
        stars_to_announcements = edges["stars"]["announcements"]
        comments_to_announcements = edges["comments"]["announcements"]
        producer_announcements_from_users = edges["producer_announcements"]["users"]
        producer_announcements_from_groups = edges["producer_announcements"][
            "groups"
        ]

        amount = (
            len(static)
            + len(users)
            + len(groups)
            + len(announcements)
            + len(places)
            + len(user_groups)
            + len(stars_to_users)
            + len(stars_to_groups)
            + len(stars_to_announcements)
            + len(comments_to_announcements)
            + len(producer_announcements_from_users)
            + len(producer_announcements_from_groups)
        )
        return amount

    async def _import_data(self, file: UploadFile) -> Response:
        """
        POST /api/import_data

        Request:
        UploadFile
        """
        if not file.filename.endswith(".json"):
            raise HTTPException(
                status_code=400, detail="A file with the extension .json is required"
            )

        try:
            file_content = await file.read()
            data = json.loads(file_content)
            self._set_dump(data)
            number_of_records = self._count_imported_records(data)
            return {
                "message": "Данные успешно импортированы!",
                "number_of_records": number_of_records
            }

        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format")
        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Server error: {err}")

    async def _export_data(self) -> FileResponse:
        """
        GET /api/export_data

        Response:
        FileResponse
        """
        graph_data = self._get_dump()

        output_file = "src/gighunt/dump/graph.json"
        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(graph_data, file, indent=4, ensure_ascii=False)

        return FileResponse(
            path=output_file,
            filename="graph.json",
            media_type="application/json"
        )

    def _get_total_stats(self):
        """
        GET /api/total_stats
        :return:
        Response {
            popular_user: User
            popular_group: Group
            popular_announcement: Announcement
            user_count: int
            group_count: int
            place_count: int
            announcement_count: int
            all_stars_count: int
            user_stars_count: int
            group_stars_count: int
            announcement_stars_count: int
        }
        """
        popular_user = self._application.user_use_cases.get_popular_user()
        popular_group = self._application.group_use_cases.get_popular_group()
        popular_announcement = self._application.announcement_use_cases.get_popular_announcement()
        user_count = self._application.user_use_cases.get_all_entities_count()
        group_count = self._application.group_use_cases.get_all_entities_count()
        announcement_count = self._application.announcement_use_cases.get_all_entities_count()
        place_count = self._application.place_use_cases.get_all_entities_count()
        user_stars = self._application.user_use_cases.get_all_stars()
        group_stars = self._application.group_use_cases.get_all_stars()
        announcement_stars = self._application.announcement_use_cases.get_all_stars()
        response = {
            "popular_user": popular_user["user"],
            "popular_group": popular_group["group"],
            "popular_announcement": popular_announcement["announcement"],
            "user_count": user_count,
            "group_count": group_count,
            "announcement_count": announcement_count,
            "place_count": place_count,
            "all_stars": user_stars+group_stars+announcement_stars,
            "user_stars": user_stars,
            "group_stars": group_stars,
            "announcement_stars": announcement_stars
        }



        return response
