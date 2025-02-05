import datetime
import time

from fastapi import APIRouter, Response

from gighunt.modules.models import GroupAnnouncement, Star, UserAnnouncement, Comment, FilterAnnouncement
from gighunt.modules.use_cases.announcement_use_cases import AnnouncementUseCases


class AnnouncementRouter:
    def __init__(self, router: APIRouter, use_cases: AnnouncementUseCases) -> None:
        self._router = router
        self._use_cases = use_cases
        self._router.add_api_route(
            "/api/announcement",
            self._get_announcements,
            methods=["POST"],
            tags=["Announcement"],
        )
        self._router.add_api_route(
            "/api/comments/{announcement_id}",
            self._get_comments,
            methods=["GET"],
            tags=["Announcement"],
        )
        self._router.add_api_route(
            "/api/user_announcement",
            self._add_user_announcement,
            methods=["POST"],
            tags=["Announcement"],
        )
        self._router.add_api_route(
            "/api/comment", self._add_comment, methods=["POST"], tags=["Announcement"]
        )
        self._router.add_api_route(
            "/api/star", self._add_star, methods=["POST"], tags=["Announcement"]
        )
        self._router.add_api_route(
            "/api/group_announcement",
            self._add_group_announcement,
            methods=["POST"],
            tags=["Announcement"],
        )
        self._router.add_api_route(
            "/api/get_announcement_star",
            self._get_is_announcement_star,
            methods=["GET"],
            tags=["Announcement"]
        )
        self._router.add_api_route(
            "/api/get_announcement",
            self._get_announcement,
            methods=["GET"],
            tags=["Announcement"]
        )

    def _get_announcements(self, page: int, page_size: int, filters: FilterAnnouncement) -> Response:
        """
        POST /api/announcements

        Response:
        [
            {
                announcement: Announcement,
                start: stars,
                sender: User
            },
            ...
        ]
        """
        return self._use_cases.get_announcements(page, page_size, filters)

    def _get_comments(self, announcement_id: int) -> Response:
        """
        GET /api/comments?announcement_id=<aId>

        Response:
        [
            {
                comment: Comment,
                sender: User
            }
        ]
        """
        return self._use_cases.get_comments(announcement_id)

    def _add_user_announcement(self, user_announcement: UserAnnouncement) -> Response:
        """
        POST /api/user_announcement

        Request:
        {
            user_id: String,
            announcement: Announcement
        }
        """
        return self._use_cases.add_user_announcement(user_announcement)

    def _add_comment(self, comment: Comment) -> Response:
        """
        POST /api/comment

        Request:
        {
            user_id: String,
            announcement_id: String,
            comment: String 
        }
        """
        return self._use_cases.add_comment(comment)

    def _add_star(self, star: Star) -> Response:
        """
        POST /api/star

        {
            from: String,
            to: String
        }
        """
        return self._use_cases.add_star(star)

    def _add_group_announcement(self, group_announcement: GroupAnnouncement) -> Response:
        """
        POST /api/group_announcement

        Request:
        {
            group_id: String,
            announcement: Announcement
        }
        """
        return self._use_cases.add_group_announcement(group_announcement)

    def _get_is_announcement_star(self, source_user_id: int, dest_announcement_id: int) ->Response:
        """
        GET /api/get_user_star?user_id=<UserId>
        :param source_user_id: int
        :param dest_announcement_id: int
        :return:
        Response:
        {
            value: bool
        }
        """
        return self._use_cases.get_is_announcement_star(source_user_id,dest_announcement_id)

    def _get_popular_announcement(self):
        """

        :return:
        Response:
        {
            status: int,
            message: string
            announcement: Announcement|None
        }
        """
        return self._use_cases.get_popular_announcement()

    def _get_announcement(self, ann_id: int):
        """

        :param ann_id:
        :return:
        {
            announcement: Announcement
            stars: int
            sender: User|Group
            comments: Comment
        }
        """

        return self._use_cases.get_announcement(ann_id)

