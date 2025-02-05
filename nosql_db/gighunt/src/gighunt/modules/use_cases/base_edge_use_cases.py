import logging
from arango.graph import Graph
from arango.exceptions import DocumentInsertError

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from arango.collection import EdgeCollection
from arango.typings import Json

class BaseEdgeUseCases:
    def __init__(self, db_client: ArangoDBClient, graph: Graph,vertex_names:dict) -> None:
        self._logger = logging.getLogger(__name__)
        self._db_client = db_client
        self._graph = graph
        self.vertex_names = vertex_names
        for key, value in self.vertex_names.items():
            self._db_client.create_edge_collection(self._graph,str(key),value["from"], value["to"])
        self.edge_collection_names = None

    def get_all_entities(self, name)-> EdgeCollection | None:
        if self._graph.has_edge_collection(name):
            return self._graph.edge_collection(name)
        return None

    def create_new_entity(self, edge_data:Json, name:str)-> bool | Json:
        return self._db_client.add_edge(self._graph, name, edge_data)

    def get_entity(self, entity_id: str, name) -> Json | None:
        return self._graph.edge_collection(name).get(entity_id)

    def insert_json_edge(self, name: str, json_edge: Json) -> None:
        try:
            self._graph.edge_collection(name).insert(json_edge)
        except DocumentInsertError as err:
            self._logger.error(f"Error inserting edge {json_edge}: {err}")

    def clear(self) -> None:
        if self.edge_collection_names:
            for name in self.edge_collection_names:
                self._graph.edge_collection(name.value).truncate()

    def delete_entity(self, entity_id: str, name)->Json|None:
        return self._graph.edge_collection(name).delete(entity_id)

    def insert_json_edge(self, name: str, json_edge: Json) -> None:
        try:
            self._graph.edge_collection(name).insert(json_edge)
        except DocumentInsertError as err:
            self._logger.error(f"Error inserting edge {json_edge}: {err}")

    def clear(self) -> None:
        if self.edge_collection_names:
            for name in self.edge_collection_names:
                self._graph.edge_collection(name.value).truncate()

    def delete_entity(self, entity_id: str, name)->Json|None:
        return self._graph.edge_collection(name).delete(entity_id)
