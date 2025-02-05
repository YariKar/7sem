from arango.graph import Graph
from gighunt.modules.clients.arangodb_client import ArangoDBClient

from gighunt.modules.use_cases.comment_use_cases import CommentUseCases
from gighunt.modules.use_cases.producer_announcement_use_cases import ProducerAnnouncementUseCases
from gighunt.modules.use_cases.user_group_use_cases import UserGroupUseCases
from gighunt.modules.use_cases.stars_use_cases import StarsUseCases


class EdgeCollectionUseCases:
    def __init__(self, db_client:ArangoDBClient, graph:Graph):
        self.comment_use_cases = CommentUseCases(db_client, graph,
                                                  {'CommentToAnnouncement': {"from": "User", "to": "Announcement"}})
        self.producer_announcement_use_cases = ProducerAnnouncementUseCases(db_client, graph,
                                                                            {'AnnouncementFromUser': {"from": "User",
                                                                                                 "to": "Announcement"},
                                                                             'AnnouncementFromGroup': {"from": "Group",
                                                                                                  "to": "Announcement"}})
        self.user_group_use_cases = UserGroupUseCases(db_client, graph,
                                                       {'UserGroup': {"from": "User", "to": "Group"}})
        self.stars_use_cases = StarsUseCases(db_client, graph,
                                              {'StarsToUser': {"from": "User", "to": "User"},
                                               'StarsToGroup': {"from": "User", "to": "Group"},
                                               'StarsToAnnouncement': {"from": "User", "to": "Announcement"}})