import datetime
import time

from fastapi import APIRouter, Response

from gighunt.modules.models import Group
from gighunt.modules.use_cases.group_use_cases import GroupUseCases
from gighunt.modules.models import GroupAnnouncement, Star, UserAnnouncement, Comment, UpdateGroup, FilterGroup

class GroupRouter:
    def __init__(self, router: APIRouter, use_cases: GroupUseCases) -> None:
        self._router = router
        self._use_cases = use_cases
        self._router.add_api_route(
            "/api/groups",
            self._get_groups,
            methods=["POST"],
            tags=["Group"],
        )
        self._router.add_api_route(
            "/api/group/{group_id}", self._get_group, methods=["GET"], tags=["Group"]
        )
        self._router.add_api_route(
            "/api/group", self._add_group, methods=["POST"], tags=["Group"]
        )
        self._router.add_api_route(
            "/api/group_star", self._add_star, methods=["POST"], tags=["Group"]
        )
        self._router.add_api_route(
            "/api/get_group_star",
            self._get_is_group_star,
            methods=["GET"],
            tags=["Group"]
        )
        self._router.add_api_route(
            "/api/join_to_group",
            self._join_to_group,
            methods=["POST"],
            tags=["Group"]
        )
        self._router.add_api_route(
            "/api/update_group",
            self._update_group,
            methods=["PUT"],
            tags=["Group"]
        )

    def _get_groups(self, page: int, page_size: int, filters: FilterGroup) -> Response:
        """
        POST /api/groups

        Response:
        {[
            {
                group: Group,
                start: stars
            },
            ...
        ]}
        """
        return self._use_cases.get_groups(page,page_size, filters)

    def _get_group(self, group_id: int) -> Response:
        """
        GET /api/group?group_id=<groupId>

        Response:
        {
            group: Group,
            stars: Number,
            participants: [
                {
                    user: User,
                    join_date: Date
                },
                ...
            ],
            announcements: [
                {
                    announcement: Announcement,
                    stars: Number
                },
                ...
            ]
        }
        """
        return self._use_cases.get_group(group_id)

    def _add_group(self, group: Group) -> Response:
        """
        POST /api/group

        Request:
        {
            name: String
        }
        """
        return self._use_cases.add_group(group)

    def _add_star(self, star: Star) -> Response:
        """
        POST /api/group_star

        {
            from: String,
            to: String
        }
        """
        return self._use_cases.add_star(star)

    def _get_is_group_star(self, source_user_id: int, dest_group_id: int) ->Response:
        """
        GET /api/get_user_star?user_id=<UserId>
        :param source_user_id: int
        :param dest_group_id: int
        :return:
        Response:
        {
            value: bool
        }
        """
        return self._use_cases.get_is_group_star(source_user_id, dest_group_id)

    def _join_to_group(self, group_id: int, user_id: int):
        """
        GET /api/join_to_group?group_id=<GroupId>?user_id=<UserId>
        :param group_id: int
        :param user_id: int
        :return:
        Response:
        {
            status: int,
            message: string
            UserGroup: {}
        }
        """
        return self._use_cases.join_to_group(group_id, user_id)

    def _update_group(self, update_group: UpdateGroup):
        '''
        PUT /api/update_group
        :param update_group: UpdateGroup
        :return:
        {
            status: int,
            message: string
            group: group
        }
        '''
        return self._use_cases.update_group(update_group)

    def _get_popular_group(self):
        """

        :return:
        Response:
        {
            status: int,
            message: string
            group: Group|None
        }
        """
        return self._use_cases.get_popular_group()



