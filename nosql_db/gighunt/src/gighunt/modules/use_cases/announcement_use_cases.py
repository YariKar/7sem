import re

from arango.graph import Graph

import datetime
import time
from collections import Counter

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from gighunt.modules.use_cases.base_vertex_use_cases import BaseVertexUseCases

from fastapi import Response

from gighunt.modules.models import GroupAnnouncement, Star, UserAnnouncement, Comment, FilterAnnouncement

class AnnouncementUseCases(BaseVertexUseCases):

    def __create_filters(self, filters: FilterAnnouncement)->dict:
        query_filters = {}
        if (filters.producer):
            query_filters["producer"] = f".*{filters.producer.lower()}.*"
        # if (filters.date):
        #     query_filters["date"] = f".*{filters.date.lower()}.*"
        if (filters.from_date):
            query_filters["from_date"] = datetime.datetime.fromisoformat(filters.from_date) #datetime.datetime.strptime(filters.from_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.to_date):
            query_filters["to_date"] = datetime.datetime.fromisoformat(filters.to_date) #datetime.datetime.strptime(filters.to_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.from_stars):
            query_filters["from_stars"] = int(filters.from_stars)
        if (filters.to_stars):
            query_filters["to_stars"] = int(filters.to_stars)
        if (filters.tag):
            query_filters["tag"] = f".*{filters.tag.lower()}.*"
        return query_filters
    def __find_by_filters(self, deque, filters:FilterAnnouncement)->list:
        query_filters = self.__create_filters(filters)
        announcements = []
        while(len(deque)):
            flag = True
            ann = deque.pop()
            if query_filters.get("producer"):
                producer_ann_use_case = self.edge_use_cases.producer_announcement_use_cases
                users_ann = producer_ann_use_case.get_all_entities(producer_ann_use_case.edge_collection_names.ANNOUNCEMENTFROMUSER.value).find({"_to": ann["_id"]}).batch()
                group_ann = producer_ann_use_case.get_all_entities(producer_ann_use_case.edge_collection_names.ANNOUNCEMENTFROMGROUP.value).find({"_to": ann["_id"]}).batch()
                producer_pattern = ""
                if (len(users_ann)):
                    user = self.get_another_entity(users_ann.pop()["_from"], "User")
                    producer_pattern = user["first_name"]+user["last_name"]
                elif (len(group_ann)):
                    group = self.get_another_entity(group_ann.pop()["_from"], "Group")
                    producer_pattern = group["name"]
                if not re.match(query_filters["producer"], producer_pattern.lower()):
                    flag = False
            # if query_filters.get("date") and not re.match(query_filters["date"], ann["creation_date"]):
            #     flag = False
            if (query_filters.get("from_date")):
                cur_date = datetime.datetime.fromisoformat(ann["creation_date"]) #datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d") 2024-11-30T21:00:00.000Z
                #print(query_filters["from_date"], cur_date)
                if query_filters["from_date"].timestamp()> cur_date.timestamp():
                    flag = False
            if (query_filters.get("to_date")):
                cur_date = datetime.datetime.fromisoformat(ann["creation_date"])  #datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d")
                if query_filters["to_date"].timestamp()< cur_date.timestamp():
                    flag = False
            if query_filters.get("from_stars"):
                stars_use_cases = self.edge_use_cases.stars_use_cases
                stars_count = len(stars_use_cases.get_all_entities(stars_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find({"_to":ann["_id"]}).batch())
                try:
                    if int(query_filters["from_stars"])> stars_count:
                        flag = False
                except ValueError:
                    print("На поиск по количеству звезд пришло не число!")
                    flag = False
            if query_filters.get("to_stars"):
                stars_use_cases = self.edge_use_cases.stars_use_cases
                stars_count = len(stars_use_cases.get_all_entities(stars_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find({"_to":ann["_id"]}).batch())
                try:
                    if int(query_filters["to_stars"])< stars_count:
                        flag = False
                except ValueError:
                    print("На поиск по количеству звезд пришло не число!")
                    flag = False
            if query_filters.get("tag") and not re.match(query_filters["tag"], ann["tag"]):
                flag = False
            if (flag):
                announcements.append(ann)
        return announcements

    def get_announcements(self, page: int, page_size: int, filters: FilterAnnouncement) -> Response:
        cursor = self.get_all_entities().all()
        deque = cursor.batch()
        announcements = self.__find_by_filters(deque, filters)[(page - 1) * page_size : (page - 1) * page_size + page_size] if page_size != 0 else self.__find_by_filters(deque, filters)
        announcement_list = []
        star_use_cases = self.edge_use_cases.stars_use_cases
        while len(announcements):
            announcement = announcements.pop()
            producer_announcements_use_case = self.edge_use_cases.producer_announcement_use_cases
            user_ann = list(producer_announcements_use_case.get_all_entities(producer_announcements_use_case.edge_collection_names.ANNOUNCEMENTFROMUSER.value).find({"_to":announcement["_id"]}).batch())
            group_ann = list(producer_announcements_use_case.get_all_entities(producer_announcements_use_case.edge_collection_names.ANNOUNCEMENTFROMGROUP.value).find({"_to":announcement["_id"]}).batch())
            prod_ann = None
            sender = {}
            if len(user_ann):
                prod_ann = user_ann[0]
                sender = self.get_another_entity(prod_ann.get("_from"), "User")
            elif len(group_ann):
                prod_ann = group_ann[0]
                sender = self.get_another_entity(prod_ann.get("_from"), "Group")
            else:
                print("no sender?")
            star_cursor = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find(
                {"_to": str(announcement["_id"])})
            user_stars = {}
            stars = list(star_cursor.batch())
            announcement_list.append({"announcement": announcement, "stars": stars, "sender": sender})
        return {"announcement_list": announcement_list, "count": self.get_all_entities_count()}

    def get_comments(self, announcement_id: int) -> Response:
        comment_use_case = self.edge_use_cases.comment_use_cases
        cursor = comment_use_case.get_all_entities(comment_use_case.edge_collection_names.COMMENTTOANNOUNCEMENT.value).find({"_to": str("Announcement/"+str(announcement_id))})
        deque = cursor.batch()
        comment_list = []
        print(deque)
        while len(deque):
            comment = deque.pop()
            user = self.get_another_entity(comment["_from"], "User")
            comment_list.append({"comment": comment, "sender": user})

        return comment_list

    def add_user_announcement(self, user_announcement: UserAnnouncement) -> Response:
        db_announcement = {
            "creation_date": str(datetime.datetime.now().date()),
            "content": user_announcement.announcement.get("content"),
            "tag": user_announcement.announcement.get("tag")
        }
        announcement = self.create_new_entity(db_announcement)
        ann_id =  announcement.get("_id")
        prod_ann_data = {
            "_from": "User/" + str(user_announcement.user_id),
            "_to": ann_id
        }
        prod_ann_use_cases = self.edge_use_cases.producer_announcement_use_cases
        prod_ann_use_cases.create_new_entity(prod_ann_data, prod_ann_use_cases.edge_collection_names.ANNOUNCEMENTFROMUSER.value)
        return announcement

    def add_comment(self, comment: Comment) -> Response:
        comment_use_case = self.edge_use_cases.comment_use_cases
        db_comment = {
            "_from": "User/" + str(comment.user_id),
            "_to": "Announcement/" + str(comment.announcement_id),
            "creation_date": str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            "content": comment.comment
        }
        return comment_use_case.create_new_entity(db_comment,comment_use_case.edge_collection_names.COMMENTTOANNOUNCEMENT.value)

    def add_star(self, star: Star) -> Response:
        star_use_case = self.edge_use_cases.stars_use_cases
        if (self.get_is_announcement_star(star.From, star.to)):
            star = star_use_case.get_all_entities(star_use_case.edge_collection_names.STARSTOANNOUNCEMENT.value).find({"_from":"User/" + str(star.From), "_to": "Announcement/" + str(star.to)}).batch().pop()
            return star_use_case.delete_entity(star["_id"], star_use_case.edge_collection_names.STARSTOANNOUNCEMENT.value)
        else:
            db_star = {
                "_from": "User/" + str(star.From),
                "_to": "Announcement/" +str(star.to)
            }
            return star_use_case.create_new_entity(db_star,star_use_case.edge_collection_names.STARSTOANNOUNCEMENT.value)

    def add_group_announcement(self, group_announcement: GroupAnnouncement) -> Response:
        db_announcement = {
            "creation_date": str(datetime.datetime.now().date()),
            "content": group_announcement.announcement.get("content"),
            "tag": group_announcement.announcement.get("tag")
        }
        announcement = self.create_new_entity(db_announcement)
        ann_id = announcement.get("_id")
        prod_ann_data = {
            "_from": "Group/" + str(group_announcement.group_id),
            "_to": ann_id
        }
        prod_ann_use_cases = self.edge_use_cases.producer_announcement_use_cases
        prod_ann_use_cases.create_new_entity(prod_ann_data,
                                                    prod_ann_use_cases.edge_collection_names.ANNOUNCEMENTFROMGROUP.value)
        return announcement

    def get_is_announcement_star(self, source_user_id: int, dest_announcement_id: int) ->Response:
        star_use_cases = self.edge_use_cases.stars_use_cases
        cursor = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find({"_from": str("User/"+str(source_user_id)), "_to":str("Announcement/" + str(dest_announcement_id))})
        star = cursor.batch()
        return len(star)!=0

    def get_popular_announcement(self):
        try:
            star_use_cases = self.edge_use_cases.stars_use_cases
            stars = star_use_cases.get_all_entities(
                star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).all().batch()
            announcement_id = [star["_to"] for star in stars]
            counter = Counter(announcement_id)
            popular_announcement_id = counter.most_common(1)[0][0]
            popular_stars = star_use_cases.get_all_entities(
                star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find(
                {"_to": str(popular_announcement_id)})
            stars_count = len(popular_stars)
            announcement = {
                "announcement": self.get_entity(popular_announcement_id),
                "stars": stars_count
            }
            return {
                "status": 200,
                "message": "success",
                "announcement": announcement
            }
        except IndexError as err:
            return {
                "status": 400,
                "message": "users doesnt have stars!",
                "announcement": None
            }
        pass

    def get_all_stars(self):
        star_use_cases = self.edge_use_cases.stars_use_cases
        stars = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).all().batch()
        stars_count = len(stars)
        return stars_count

    def get_announcement(self, ann_id: int):
        ann_entity = self.get_entity(str(ann_id))
        star_use_cases = self.edge_use_cases.stars_use_cases
        stars = star_use_cases.get_all_entities(star_use_cases.edge_collection_names.STARSTOANNOUNCEMENT.value).find(
            {"_to": str("Announcement/" + str(ann_id))})
        stars_count = len(stars)
        producer_announcements_use_case = self.edge_use_cases.producer_announcement_use_cases
        user_ann = list(producer_announcements_use_case.get_all_entities(
            producer_announcements_use_case.edge_collection_names.ANNOUNCEMENTFROMUSER.value).find(
            {"_to": ann_entity["_id"]}).batch())
        group_ann = list(producer_announcements_use_case.get_all_entities(
            producer_announcements_use_case.edge_collection_names.ANNOUNCEMENTFROMGROUP.value).find(
            {"_to": ann_entity["_id"]}).batch())
        sender = {}
        if len(user_ann):
            prod_ann = user_ann[0]
            sender = self.get_another_entity(prod_ann.get("_from"), "User")
        elif len(group_ann):
            prod_ann = group_ann[0]
            sender = self.get_another_entity(prod_ann.get("_from"), "Group")
        else:
            print("no sender?")
        comments = self.get_comments(ann_id)

        announcement = {
            "announcement": ann_entity,
            "stars": stars_count,
            "sender": sender,
            "comments": comments
        }
        return announcement

