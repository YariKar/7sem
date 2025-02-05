from arango import ArangoClient
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from gighunt.modules.settings import ApplicationSettings
from gighunt.modules.use_cases.announcement_use_cases import AnnouncementUseCases
from gighunt.modules.use_cases.group_use_cases import GroupUseCases
from gighunt.modules.use_cases.place_use_cases import PlaceUseCases
from gighunt.modules.use_cases.user_use_cases import UserUseCases
from gighunt.modules.use_cases.all_edge_use_cases import EdgeCollectionUseCases

class Application:
    def __init__(self, app: FastAPI, settings: ApplicationSettings) -> None:
        self._app = app

        self._app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        arango_host = f"{settings.arangodb_settings.protocol}://{settings.arangodb_settings.hostname}:{settings.arangodb_settings.port}"
        arango_client = ArangoClient(hosts=arango_host)
        self._arangodb_client = ArangoDBClient(arango_client)
        database_name = settings.arangodb_settings.database_name
        graph_name = settings.arangodb_settings.graph_name

        self._arangodb_client.delete_database(database_name)
        self._arangodb_client.create_database(database_name)
        self._database = self._arangodb_client.connect_to_database(database_name)
        self._graph = self._arangodb_client.create_graph_in_database(
            self._database, graph_name
        )

        self._edge_use_cases = EdgeCollectionUseCases(self._arangodb_client, self._graph)
        self._announcement_use_cases = AnnouncementUseCases(
            self._arangodb_client, self._graph, "Announcement",self._edge_use_cases
        )
        self._group_use_cases = GroupUseCases(
            self._arangodb_client, self._graph, "Group",self._edge_use_cases
        )
        self._user_use_cases = UserUseCases(self._arangodb_client, self._graph, "User",self._edge_use_cases)
        self._place_use_cases = PlaceUseCases(
            self._arangodb_client, self._graph, "Place",None
        )

    @property
    def app(self) -> FastAPI:
        return self._app

    @property
    def announcement_use_cases(self) -> AnnouncementUseCases:
        return self._announcement_use_cases

    @property
    def group_use_cases(self) -> GroupUseCases:
        return self._group_use_cases

    @property
    def user_use_cases(self) -> UserUseCases:
        return self._user_use_cases

    @property
    def place_use_cases(self) -> PlaceUseCases:
        return self._place_use_cases

    @property
    def arangodb_client(self) -> ArangoDBClient:
        return self._arangodb_client

    @property
    def database(self) -> ArangoDBClient:
        return self._database

    @property
    def graph(self) -> ArangoDBClient:
        return self._graph

    @property
    def edges_use_cases(self) -> EdgeCollectionUseCases:
        return self._edge_use_cases
