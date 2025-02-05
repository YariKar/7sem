const protocol = 'http';
const host = 'localhost';
const port = '8000';

const baseUrl = `${protocol}://${host}:${port}/api`;

export function getUser(userId) {
    return fetch(`${baseUrl}/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function postUserAnnouncement(userId, announcement) {
    return fetch(`${baseUrl}/user_announcement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId, announcement: announcement })
        })
        .then(response => response.json());
}

export function postGroupAnnouncement(groupId, announcement) {
    return fetch(`${baseUrl}/group_announcement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ group_id: groupId, announcement: announcement })
        })
        .then(response => response.json());
}

export function getUserStarred(sourceUserId, destinationUserId) {
    return fetch(`${baseUrl}/get_user_star?source_user_id=${sourceUserId}&dest_user_id=${destinationUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function addStarToUser(sourceUserId, destinationUserId) {
    return fetch(`${baseUrl}/user_star`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from: sourceUserId, to: destinationUserId })
        })
        .then(response => response.json());
}

export function addStarToGroup(sourceUserId, destinationGroupId) {
    return fetch(`${baseUrl}/group_star`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from: sourceUserId, to: destinationGroupId })
        })
        .then(response => response.json());
}

export function getGroupStarred(sourceUserId, destinationGroupId) {
    return fetch(`${baseUrl}/get_group_star?source_user_id=${sourceUserId}&dest_group_id=${destinationGroupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function getAnnouncementStarred(sourceUserId, destinationAnnouncementId) {
    return fetch(`${baseUrl}/get_announcement_star?source_user_id=${sourceUserId}&dest_announcement_id=${destinationAnnouncementId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function addStarToAnnouncement(sourceUserId, destinationAnnouncementId) {
    return fetch(`${baseUrl}/star`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ from: sourceUserId, to:destinationAnnouncementId })
        })
        .then(response => response.json());
}

export function getTags() {
    return fetch(`${baseUrl}/static_all/?static_field=tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function authorization(email, password) {
    return fetch(`${baseUrl}/authorization`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        })
        .then(response => response.json());
}

export function registration(firstName, lastName, email, password) {
    return fetch(`${baseUrl}/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: firstName, surname: lastName, email: email, password: password })
        })
        .then(response => response.json());
}

export function getAnnouncement(announcementId) {
    return fetch(`${baseUrl}/get_announcement?ann_id=${announcementId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function getAnnouncements(page, pageSize, filter) {
    return fetch(`${baseUrl}/announcement?page=${page}&page_size=${pageSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        })
        .then(response => response.json());
}

export function getUsers(page, pageSize, filter) {
    return fetch(`${baseUrl}/users?page=${page}&page_size=${pageSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        })
        .then(response => response.json());
}

export function joinGroup(groupId, userId) {
    return fetch(`${baseUrl}/join_to_group?group_id=${groupId}&user_id=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function getGroup(groupId) {
    return fetch(`${baseUrl}/group/${groupId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());

}

export function getGroups(page, pageSize, filter) {
    return fetch(`${baseUrl}/groups?page=${page}&page_size=${pageSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        })
        .then(response => response.json());
}

export function getPlaces(page, pageSize, filter) {
    return fetch(`${baseUrl}/places?page=${page}&page_size=${pageSize}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filter)
        })
        .then(response => response.json());
}

export function createGroup(groupName) {
    return fetch(`${baseUrl}/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: groupName })
        })
        .then(response => response.json());
} 

export function createPlace(placeName, placeType, placeAddress, placeNumber) {
    return fetch(`${baseUrl}/place`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: placeName, type: placeType, address: placeAddress, phone_number: placeNumber })
        })
        .then(response => response.json());
} 

export function importData(data) {
    return fetch(`${baseUrl}/import_data`, {
            method: 'POST',
            headers: {
            },
            body: data 
        })
        .then(response => response.json());
}

export function exportData() {
    return fetch(`${baseUrl}/export_data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            response.blob().then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'data.json';
                document.body.appendChild(a);
                a.click();
                // a.remove();
            });
        });
}

export function getStatistics() {
    return fetch(`${baseUrl}/get_total_stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function getComments(announcementId) {
    return fetch(`${baseUrl}/comments/${announcementId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json());
}

export function postComment(userId, announcenmentId, comment) {
    return fetch(`${baseUrl}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                announcement_id: announcenmentId,
                comment: {content: comment}
            })
        })
        .then(response => response.json());
}
