from arango.graph import Graph

import datetime
import time
import re

from fastapi import Response
from gighunt.modules.models import Place, FilterPlace

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from gighunt.modules.use_cases.base_vertex_use_cases import BaseVertexUseCases

class PlaceUseCases(BaseVertexUseCases):

    def __create_filters(self, filters: FilterPlace)->dict:
        query_filters = {}
        if filters.name:
            query_filters["name"] = f".*{filters.name.lower()}.*"
        if filters.type:
            query_filters["type"] = f".*{filters.type.lower()}.*"
        if filters.address:
            query_filters["address"] = f".*{filters.address.lower()}.*"
        if filters.number:
            query_filters["number"] =  fr".*{re.escape(filters.number.lower())}.*"
        if filters.equipment:
            query_filters["equipment"] = f".*{filters.equipment.lower()}.*"
        if (filters.from_date):
            query_filters["from_date"] = datetime.datetime.fromisoformat(
                filters.from_date)  # datetime.datetime.strptime(filters.from_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.to_date):
            query_filters["to_date"] = datetime.datetime.fromisoformat(
                filters.to_date)  # datetime.datetime.strptime(filters.to_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.from_creation):
            query_filters["from_creation"] = datetime.datetime.fromisoformat(
                filters.from_creation)  # datetime.datetime.strptime(filters.from_date, "%Y-%m-%dT%H:%M:%SZ")
        if (filters.to_creation):
            query_filters["to_creation"] = datetime.datetime.fromisoformat(filters.to_creation)
        return query_filters
    def __find_by_filters(self, deque, filters)->list:
        query_filters = self.__create_filters(filters)
        places = []
        while(len(deque)):
            flag = True
            place = deque.pop()
            if query_filters.get("name") and not re.match(query_filters["name"], place["name"].lower()):
                flag = False
            if query_filters.get("type") and not re.match(query_filters["type"], place["type"].lower()):
                flag = False
            if query_filters.get("address") and not re.match(query_filters["address"], place["address"].lower()):
                flag = False
            if query_filters.get("number") and not re.match(query_filters["number"], place["phone_number"].lower()):
                flag = False
            if query_filters.get("equipment") and not re.match(query_filters["equipment"], ''.join(list(place["equipment"].values())).lower()):
                flag = False
            if (query_filters.get("from_date")):
                cur_date = datetime.datetime.fromisoformat(place["last_edit_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d") 2024-11-30T21:00:00.000Z
                # print(query_filters["from_date"], cur_date)
                if query_filters["from_date"].timestamp() > cur_date.timestamp():
                    flag = False
            if (query_filters.get("to_date")):
                cur_date = datetime.datetime.fromisoformat(place["last_edit_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d")
                if query_filters["to_date"].timestamp() < cur_date.timestamp():
                    flag = False
            if (query_filters.get("from_creation")):
                cur_date = datetime.datetime.fromisoformat(place["creation_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d") 2024-11-30T21:00:00.000Z
                # print(query_filters["from_date"], cur_date)
                if query_filters["from_creation"].timestamp() > cur_date.timestamp():
                    flag = False
            if (query_filters.get("to_creation")):
                cur_date = datetime.datetime.fromisoformat(
                    place["creation_date"])  # datetime.datetime.strptime(ann["creation_date"], "%Y-%m-%d")
                if query_filters["to_creation"].timestamp() < cur_date.timestamp():
                    flag = False
            if (flag):
                places.append(place)
        return places


    def get_places(self, page: int, page_size: int, filters: FilterPlace) -> Response:
        cursor =  self.get_all_entities().all()#skip=(page-1)*page_size, limit=page_size
        deque = cursor.batch()
        places = self.__find_by_filters(deque,filters)[(page - 1) * page_size : (page - 1) * page_size + page_size] if page_size != 0 else self.__find_by_filters(deque, filters)
        places_list = []
        while len(places):
            place = places.pop()
            places_list.append(place)
        return {"places_list": places_list, "count": self.get_all_entities_count()}

    def add_place(self, place: Place) -> Response:
        db_place = {
                "name": place.name,
                "creation_date": str(datetime.datetime.now().date()),
                "last_edit_date": str(datetime.datetime.now().date()),
                "avatar_uri":"",
                "type": place.type,
                "address": place.address,
                "phone_number": place.phone_number,
                "area": "",
                "equipment": {"":""}
        }
        return self.create_new_entity(db_place)

    def get_place(self, place_id: int) ->Response:
        return self.get_entity(str(place_id))

    pass

