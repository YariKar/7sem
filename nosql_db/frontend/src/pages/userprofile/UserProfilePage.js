import './UserProfilePage.css';

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

import { UserContext } from '../../contexts/UserContext.js';

import TalentDisplay from '../components/talentdisplay/TalentDisplay.js';
import UserGroupInfo from '../components/usergroupinfo/UserGroupInfo.js';
import PostAnnouncement from '../components/postannouncement/PostAnnouncement.js';
import Announcement from '../components/announcement/Announcement.js';

import { getUser, getUserStarred, addStarToUser } from '../../requests/Requests.js';

import { ReactComponent as BigStarIcon } from './assets/big-star.svg';

const CustomButton = styled(Button)(() => ({
    width: '120px',
    height: '40px',

    backgroundColor: 'var(--primary-color)',
    borderRadius: '10px',

    color: 'var(--contrast-text-color)',
    fontSize: '10px',
    fontWeight: 'normal',
    textTransform: 'none'
}));

export default function UserProfile(props) {

    const { userId } = useParams();
    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);

    const [profileStarred, setProfileStarred] = useState(false);
    const [starsAmount, setStarsAmount] = useState(0);
    const [user, setUser] = useState(undefined);
    const [announcements, setAnnouncements] = useState([]);
    const [groups, setGroups] = useState([]);

    const handleStarClick = (event) => {
        if (profileStarred) {
            addStarToUser(authentifiedUserId, userId).then((response) => {
                setProfileStarred(false);
                setStarsAmount(Number(starsAmount) - 1);
            });
        } else {
            addStarToUser(authentifiedUserId, userId).then((response) => {
                setProfileStarred(true);
                setStarsAmount(Number(starsAmount) + 1);
            });
        }
    }

    const handleInviteClick = (event) => {
        toast("Приглашение в группу запрещено!");
    }

    const handleEditClick = (event) => {
        toast("Редактирование профиля запрещено!");
    }

    useEffect(() => {
        getUser(userId).then((response) => {
            setUser(response.user);
            setStarsAmount(response.stars);
            setGroups(response.groups);
            setAnnouncements(response.announcements.reverse());
        });
        getUserStarred(authentifiedUserId, userId).then((response) => {
            setProfileStarred(response);
        })
    }, []);

    return <>
        {user === undefined ? <div></div> :
            <div className='border-box flex-column width-full height-full' style={{boxSizing: 'border-box', paddingTop: '70px', gap: '40px'}}>
                <div className='flex-row flex-space width-full' style={{height: '230px', gap: '30px'}}>
                    <div className='visible-layout height-full width-full' style={{minWidth: '0px'}}>
                        <div className='border-box height-full width-full' style={{padding: '30px 0 30px 0'}}>
                            <div className='flex-row flex-space border-box width-full height-full' style={{padding: '0 100px 0 60px', gap: '30px'}}>
                                <div className='fit-width'>
                                    <div className='avatar-container'>
                                        <img className='width-full height-full' style={{objectFit: 'cover'}} alt='' src={user?.avatar_uri}></img>
                                    </div>
                                </div>
                                <div className='flex-column flex-center height-full width-full' style={{gap: '5px'}}>
                                    <div className='flex-row flex-space width-full'>
                                        <div className='flex-column'>
                                            <div className='first-name-text'>{user?.first_name}</div>
                                            <div className='last-name-text'>{user?.last_name}</div>
                                        </div>
                                        <div className='flex-column align-center flex-center' style={{gap: '5px'}}>
                                            <BigStarIcon
                                                style={{
                                                    stroke: 'var(--primary-color)', 
                                                    fill: profileStarred ? 'var(--primary-color)' : 'none'
                                                }}
                                                onClick={handleStarClick}
                                            />
                                            <div className='stars-count'>{starsAmount}</div>
                                        </div> 
                                    </div>
                                    <div className='flex-row flex-space width-full'>
                                        <div className='tertiary-info'>Впервые присоединился</div>
                                        <div className='tertiary-info'>{format(new Date(user.creation_date), 'HH:mm dd.MM.yyyy')}</div>
                                    </div>
                                    <div className='flex-row flex-space width-full'>
                                        <div className='tertiary-info'>Последнее изменение</div>
                                        <div className='tertiary-info'>{format(new Date(user.last_edit_date), 'HH:mm dd.MM.yyyy')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='visible-layout height-full' style={{minWidth: '340px'}}>
                        <div className='border-box flex-row width-full height-full' style={{padding: '0 35px 0 35px'}}>
                            <div className='border-box flex-column width-full height-full' style={{padding: '25px 0 25px 0', gap: '10px'}}>
                                <div className='fit-height'>
                                    <div className='caption'>Таланты</div>
                                </div>
                                <div className='scroll-column' style={{gap: '10px', paddingRight: '10px'}}>
                                    {
                                        user?.talents.map((talent) => {
                                            return <TalentDisplay
                                                key={talent}
                                                talent={talent}
                                            />
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex-row width-full height-full' style={{gap: '30px'}}>
                    <div className='flex-column width-full heigth-full' style={{gap: '20px'}}>
                        <div className='border-box visible-layout flex-column width-full' style={{minWidth: '600px', height: '80px', padding: '16px 0 16px 0'}}>
                            <div className='border-box flex-row flex-space width-full height-full align-center' style={{padding: '0 20px 0 40px'}}>
                                <div className='caption'>
                                    Действия
                                </div>
                                <div className='flex-row' style={{gap: '10px'}}>
                                    { userId === authentifiedUserId ?
                                        <>
                                            {/* <CustomButton className='actions-button' variant='contained' */}
                                            {/*     onClick={handleEditClick} */}
                                            {/* > */}
                                            {/*     Редактировать профиль */}
                                            {/* </CustomButton> */}
                                        </>
                                        :
                                        <CustomButton className='actions-button' variant='contained'
                                            onClick={handleInviteClick}
                                        >
                                            Пригласить в группу
                                        </CustomButton>
                                    }
                                </div>
                            </div>
                        </div>
                        { userId === authentifiedUserId ?
                            <PostAnnouncement 
                                author="user"
                                authorId={userId}

                            />
                            :
                            <></>
                        }
                        <div className='width-full height-full' style={{position: 'relative'}}>
                            <div className='scroll-column' style={{gap: '20px'}}>
                                {
                                    announcements.reverse().map((announcement) => {
                                        return <Announcement 
                                            key={announcement.announcement._key}
                                            announcementId={announcement.announcement._key}
                                            authorName={user?.first_name}
                                            tag={announcement.announcement.tag}
                                            date={announcement.announcement.creation_date}
                                            content={announcement.announcement.content}
                                            starsAmount={announcement.stars}
                                        />
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className='fit-width'>
                        <div className='visible-layout border-box flex-row' style={{width: '340px', height: '450px', padding: '0 35px 0 35px'}}>
                            <div className='border-box flex-column width-full height-full' style={{padding: '25px 0 40px 0', gap: '10px'}}>
                                <div className='caption'>Группы</div>
                                <div className='scroll-column' style={{gap: '15px', paddingRight: '15px'}}>
                                    {
                                        groups.map((group) => {
                                            return <UserGroupInfo
                                                key={group.group._key}
                                                group={group.group}
                                                joinDate={format(new Date(group.join_date), 'HH:mm dd.MM.yyyy')}
                                            />
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
    </>;
};
