from arango.graph import Graph

import datetime
import time
from collections import Counter
import re

from fastapi import Response

from gighunt.modules.models import Group


from gighunt.modules.clients.arangodb_client import ArangoDBClient
from gighunt.modules.use_cases.base_vertex_use_cases import BaseVertexUseCases
from gighunt.modules.models import GroupAnnouncement, Star, UserAnnouncement, Comment, UpdateGroup, FilterGroup

class GroupUseCases(BaseVertexUseCases):

    def __create_filters(self, filters: FilterGroup)->dict:
        query_filters = {}
        # name: str | None
        # genre: str | None
        # from_date: str | None
        # to_date: str | None
        # from_creation: str | None
        # to_creation: str | None
        # from_stars: str | int | None
        # to_stars: str | int | None
        # participant: str | None
        if (filters.name):
            query_filters["name"] = f".*{filters.name.lower()}.*"
        if (filters.genre):
            query_filters["genre"] = f".*{filters.genre.lower()}.*"
        # if (filters.stars):
        #     query_filters["stars"] = f"{filters.stars}"
        if (filters.from_date):
            query_filters["from_date"] = datetime.datetime.fromisoformat(filters.from_date) #datetime.datetime.strptime(filters.from_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.to_date):
            query_filters["to_date"] = datetime.datetime.fromisoformat(filters.to_date) #datetime.datetime.strptime(filters.to_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.from_creation):
            query_filters["from_creation"] = datetime.datetime.fromisoformat(filters.from_creation) #datetime.datetime.strptime(filters.from_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.to_creation):
            query_filters["to_creation"] = datetime.datetime.fromisoformat(filters.to_creation)
        if (filters.from_stars):
            query_filters["from_stars"] = int(filters.from_stars)
        if (filters.to_stars):
            query_filters["to_stars"] = int(filters.to_stars)
        if (filters.participant):
            query_filters["participant"] = f".*{filters.participant.lower()}.*"

        return query_filters
    def __find_by_filters(self, deque, filters)->list:
        query_filters = self.__create_filters(filters)
        groups = []
        while len(deque):
            flag = True
            group = deque.pop()
            if query_filters.get("name") and not re.match(query_filters["name"], group["name"].lower()):
                flag = False
            if query_filters.get("genre") and not re.match(query_filters["genre"], ''.join(group["genres"]).lower()):
                flag = False
            # if query_filters.get("stars"):
            #     stars_use_cases = self.edge_use_cases.stars_use_cases
            #     stars_count = len(stars_use_cases.get_all_entities(stars_use_cases.edge_collection_names.STARSTOGROUP.value).find({"_to":group["_id"]}).batch())
            #     try:
            #         if int(query_filters["stars"])> stars_count:
            #             flag = False
            #     except ValueError:
            #         print("На поиск по количеству звезд пришло не число!")
            #         flag = False
            if (query_filters.get("from_date")):
                cur_date = datetime.datetime.fromisoformat(group["last_edit_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d") 2024-11-30T21:00:00.000Z
                # print(query_filters["from_date"], cur_date)
                if query_filters["from_date"].timestamp() > cur_date.timestamp():
                    flag = False
            if (query_filters.get("to_date")):
                cur_date = datetime.datetime.fromisoformat(group["last_edit_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d")
                if query_filters["to_date"].timestamp() < cur_date.timestamp():
                    flag = False
            if (query_filters.get("from_creation")):
                cur_date = datetime.datetime.fromisoformat(group["creation_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d") 2024-11-30T21:00:00.000Z
                # print(query_filters["from_date"], cur_date)
                if query_filters["from_creation"].timestamp() > cur_date.timestamp():
                    flag = False
            if (query_filters.get("to_creation")):
                cur_date = datetime.datetime.fromisoformat(
                    group["creation_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d")
                if query_filters["to_creation"].timestamp() < cur_date.timestamp():
                    flag = False
            if query_filters.get("from_stars"):
                stars_use_cases = self.edge_use_cases.stars_use_cases
                stars_count = len(stars_use_cases.get_all_entities(
                    stars_use_cases.edge_collection_names.STARSTOGROUP.value).find({"_to": group["_id"]}).batch())
                try:
                    if int(query_filters["from_stars"]) > stars_count:
                        flag = False
                except ValueError:
                    print("На поиск по количеству звезд пришло не число!")
                    flag = False
            if query_filters.get("to_stars"):
                stars_use_cases = self.edge_use_cases.stars_use_cases
                stars_count = len(stars_use_cases.get_all_entities(
                    stars_use_cases.edge_collection_names.STARSTOGROUP.value).find({"_to": group["_id"]}).batch())
                try:
                    if int(query_filters["to_stars"]) < stars_count:
                        flag = False
                except ValueError:
                    print("На поиск по количеству звезд пришло не число!")
                    flag = False

            if (query_filters.get("participant")):
                user_group_use_case = self.edge_use_cases.user_group_use_cases
                ug_list = user_group_use_case.get_all_entities(
                    user_group_use_case.edge_collection_names.USERGROUP.value).find({"_to": group["_id"]}).batch()
                user_names = ""
                for current_ug in ug_list:
                    current_user = self.get_another_entity(current_ug["_from"], "User")
                    user_names+=current_user["first_name"]+current_user["last_name"]
                if not re.match(query_filters["participant"], user_names.lower()):
                    flag = False
            if (flag):
                groups.append(group)
        return groups

    def get_groups(self, page: int, page_size: int, filters: FilterGroup) -> Response:
        cursor = self.get_all_entities().all()
        deque = cursor.batch()
        groups = self.__find_by_filters(deque, filters)[(page - 1) * page_size : (page - 1) * page_size + page_size] if page_size != 0 else self.__find_by_filters(deque, filters)
        group_list = []
        star_use_cases = self.edge_use_cases.stars_use_cases
        while len(groups):
            group = groups.pop()
            star_cursor = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOGROUP.value).find(
                {"_to": str(group["_id"])})
            stars = list(star_cursor.batch())
            user_group_use_cases = self.edge_use_cases.user_group_use_cases
            user_groups = user_group_use_cases.get_all_entities(
                user_group_use_cases.edge_collection_names.USERGROUP.value).find(
                {"_to": group["_id"]}
            ).batch()
            users = []
            for user_group_edge in user_groups:
                current_user = self.get_another_entity(user_group_edge["_from"], "User")
                current_join_date = user_group_edge["join_date"]
                users.append({"user": current_user, "join_date": current_join_date})
            group_list.append({"group": group, "stars": stars, "users": users})
        return {"group_list": group_list , "count": self.get_all_entities_count()}

    def get_group(self, group_id: int) -> Response:
        group = self.get_entity(str(group_id))
        star_use_cases = self.edge_use_cases.stars_use_cases
        stars = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOUSER.value).find(
            {"_to": str("Group/" + str(group_id))})
        stars_count = len(stars)
        user_group_use_cases = self.edge_use_cases.user_group_use_cases
        user_groups = user_group_use_cases.get_all_entities(
            user_group_use_cases.edge_collection_names.USERGROUP.value).find(
            {"_to": str("Group/" + str(group_id))}
        ).batch()
        users = []
        for user_group_edge in user_groups:
            current_user = self.get_another_entity(user_group_edge["_from"], "User")
            current_join_date = user_group_edge["join_date"]
            users.append({"user": current_user, "join_date": current_join_date})

        prod_announcements = self.edge_use_cases.producer_announcement_use_cases
        group_announcements = prod_announcements.get_all_entities(prod_announcements.edge_collection_names.ANNOUNCEMENTFROMGROUP.value).find(
            {"_from": str("Group/" + str(group_id))}
        ).batch()
        announcements = []
        for group_ann_edge in group_announcements:
            current_ann = self.get_another_entity(group_ann_edge["_to"], "Announcement")
            current_stars = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find({"_to": group_ann_edge["_to"]})
            current_ann_stars_count = len(current_stars)
            announcements.append({"announcement": current_ann, "stars": current_ann_stars_count})

        group = {
            "group": group,
            "stars": stars_count,
            "participants": users,
            "announcements": announcements
        }
        return group

    def add_group(self, group: Group) -> Response:
        db_group = {
            "name":group.name,
            "creation_date": str(datetime.datetime.now().date()),
            "last_edit_date":str(datetime.datetime.now().date()),
            "avatar_uri":"",
            "genres": []
        }
        return self.create_new_entity(db_group)

    def add_star(self, star: Star) -> Response:
        star_use_case = self.edge_use_cases.stars_use_cases
        if self.get_is_group_star(star.From, star.to):
            star = star_use_case.get_all_entities(star_use_case.edge_collection_names.STARSTOGROUP.value).find({"_from":"User/" + str(star.From), "_to": "Group/" + str(star.to)}).batch().pop()
            return star_use_case.delete_entity(star["_id"], star_use_case.edge_collection_names.STARSTOGROUP.value)
        else:
            db_star = {
                "_from": "User/" + str(star.From),
                "_to": "Group/" + str(star.to)
            }
            return star_use_case.create_new_entity(db_star,star_use_case.edge_collection_names.STARSTOGROUP.value)

    def get_is_group_star(self, source_user_id: int, dest_group_id: int) ->Response:
        star_use_cases = self.edge_use_cases.stars_use_cases
        cursor = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOGROUP.value).find({"_from": str("User/"+str(source_user_id)), "_to":str("Group/" + str(dest_group_id))})
        star = cursor.batch()
        return len(star)!=0

    def _is_joined_group(self, group_id: int, user_id: int) -> bool:
        user_group_use_cases = self.edge_use_cases.user_group_use_cases
        cursor = user_group_use_cases.get_all_entities(user_group_use_cases.edge_collection_names.USERGROUP.value).find({"_from": str("User/"+str(user_id)), "_to":str("Group/" + str(group_id))})
        ug = cursor.batch()
        return len(ug)!=0

    def join_to_group(self, group_id: int, user_id: int):
        db_user_group = {
            "_from": "User/" + str(user_id),
            "_to": "Group/" + str(group_id),
            "join_date": str(datetime.datetime.now().date())
        }
        user_group_use_cases = self.edge_use_cases.user_group_use_cases
        try:
            if(self._is_joined_group(group_id, user_id)):
                user_group_use_cases
                ug = user_group_use_cases.get_all_entities(user_group_use_cases.edge_collection_names.USERGROUP.value).find(
                    {"_from": "User/" + str(user_id), "_to": "Group/" + str(group_id)}).batch().pop()
                return {
                    "status": 200,
                    "message": "user leave group",
                    "UserGroup": user_group_use_cases.delete_entity(ug["_id"], user_group_use_cases.edge_collection_names.USERGROUP.value)
                }
            else:
                user_group_edge = user_group_use_cases.create_new_entity(db_user_group, user_group_use_cases.edge_collection_names.USERGROUP.value)
                print(user_group_edge)
                return {
                    "status": 200,
                    "message": "success join to group",
                    "UserGroup": user_group_edge
                }
        except Exception as err:
            print(err)
            return {
                "status": 500,
                "message": "something wrong: "+str(err),
                "UserGroup": {}
            }

    def update_group(self, update_group: UpdateGroup):
        try:
            group = self._graph.vertex_collection(self._name).update(
                {"_key": str(update_group.id), "name": update_group.name,
                 "avatar_uri": update_group.photo})
            return {
                "code": 200,
                "status": "success update",
                "user": group
            }
        except Exception as err:
            return {
                "code": 500,
                "status": "something wrong: " + str(err),
                "user": self.get_entity(str("User/" + str(update_group.id)))
            }
        return

    def get_popular_group(self) -> Response:
        try:
            star_use_cases = self.edge_use_cases.stars_use_cases
            stars = star_use_cases.get_all_entities(
                star_use_cases.edge_collection_names.STARSTOGROUP.value).all().batch()
            group_id = [star["_to"] for star in stars]
            counter = Counter(group_id)
            popular_group_id = counter.most_common(1)[0][0]

            popular_stars = star_use_cases.get_all_entities(
                star_use_cases.edge_collection_names.STARSTOGROUP.value).find(
                {"_to": str(popular_group_id)})
            stars_count = len(popular_stars)

            user_group_use_cases = self.edge_use_cases.user_group_use_cases
            user_groups = user_group_use_cases.get_all_entities(
                user_group_use_cases.edge_collection_names.USERGROUP.value).find(
                {"_to": str(popular_group_id)}
            ).batch()
            user_groups_count = len(user_groups)

            group = {
                "group": self.get_entity(popular_group_id),
                "stars": stars_count,
                "participants": user_groups_count
            }
            return {
                "status": 200,
                "message": "success",
                "group": group
            }
        except IndexError as err:
            return {
                "status": 400,
                "message": "groups doesnt have stars!",
                "group": None
            }

    def get_all_stars(self):
        star_use_cases = self.edge_use_cases.stars_use_cases
        stars = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOGROUP.value).all().batch()
        stars_count = len(stars)
        return stars_count
