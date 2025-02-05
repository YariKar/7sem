import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { NavLink } from 'react-router-dom';

import { UserContext } from '../../contexts/UserContext.js';
import SelectTag from '../components/selecttag/SelectTag.js';
import Comments from '../components/comments/Comments.js';

import { getAnnouncement, getAnnouncementStarred, addStarToAnnouncement } from '../../requests/Requests.js';

export default function AnnouncementProfile(props) {

    const { announcementId } = useParams();
    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);

    const [announcement, setAnnouncement] = useState(undefined);
    const [sender, setSender] = useState(undefined);

    useEffect(() => {
        getAnnouncement(announcementId).then((response) => {
            setAnnouncement(response.announcement);
            setSender(response.sender);
        });
    }, []);

    if (announcement === undefined) {
        return <>
        </>;
    }

    return <>
        <div
            className='border-box flex-column width-full height-full'
            style={{
                boxSizing: 'border-box',
                paddingTop: '70px',
                gap: '20px'
            }}
        >
            <div
                className='width-full visible-layout text border-box'

                style={{
                    padding: '10px 20px',
                }}
            >
                Дата публикации: {format(new Date(announcement.creation_date), 'HH:mm dd.MM.yyyy')}
            </div>
            <div
                className='width-full flex-row visible-layout text border-box align-center'

                style={{
                    padding: '10px 20px',
                    gap: '10px'
                }}
            >
                <div>
                    Тэг:
                </div>
                <SelectTag 
                    value={announcement.tag}
                    disabled={true}
                />
            </div>
            <div
                className='width-full flex-row visible-layout text border-box align-center'

                style={{
                    padding: '10px 20px',
                    gap: '10px'
                }}
            >
                <div>
                    Отправитель:
                </div>
                <NavLink to={`/${sender.name === undefined ? "users" : "groups"}/${sender._key}`} style={{textDecoration: 'none'}}>
                    <div className='important-text'>
                        {sender.name === undefined ? sender.first_name + ' ' + sender.last_name : sender.name}
                    </div>
                </NavLink>
            </div>
            <div
                className='width-full flex-column visible-layout text border-box'

                style={{
                    padding: '10px 20px',
                    gap: '10px'
                }}
            >
                <div
                    className='important-text'
                >
                    Содержимое:
                </div>
                <div>
                    {announcement.content}
                </div>
            </div>
            <Comments
                announcementId={announcementId}
            />
        </div>
    </>;
};
