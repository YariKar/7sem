import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext.js';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { getGroup, getGroupStarred, addStarToGroup, joinGroup } from '../../requests/Requests.js';

import Announcement from '../components/announcement/Announcement.js';
import PostAnnouncement from '../components/postannouncement/PostAnnouncement.js';
import { CustomButton } from '../components/CustomMuiComponents.js';
import GroupMemberInfo from '../components/groupmemberinfo/GroupMemberInfo.js';

import { ReactComponent as BigStarIcon } from './assets/big-star.svg';

export default function GroupProfile(props) {

    const { groupId } = useParams();
    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);

    const [profileStarred, setProfileStarred] = useState(false);
    const [starsAmount, setStarsAmount] = useState(0);
    const [group, setGroup] = useState(undefined);
    const [announcements, setAnnouncements] = useState([]);
    const [members, setMembers] = useState([]);
    const [userInGroup, setUserInGroup] = useState(false);

    const handleStarClick = (event) => {
        if (profileStarred) {
            addStarToGroup(authentifiedUserId, groupId).then((response) => {
                setProfileStarred(false);
                setStarsAmount(Number(starsAmount) - 1);
            });
        } else {
            addStarToGroup(authentifiedUserId, groupId).then((response) => {
                setProfileStarred(true);
                setStarsAmount(Number(starsAmount) + 1);
            });
        }
    }

    const handleJoinClick = (event) => {
        joinGroup(groupId, authentifiedUserId).then((response) => {
            setUserInGroup(true);
        });
    }
    const handleLeaveClick = (event) => {
        joinGroup(groupId, authentifiedUserId).then((response) => {
            setUserInGroup(false);
        });
    }

    useEffect(() => {
        getGroup(groupId).then((response) => {
            setGroup(response.group);
            setStarsAmount(response.stars);
            setMembers(response.participants);
            response.participants.forEach((participant) => {
                if (participant.user._key === authentifiedUserId) {
                    setUserInGroup(true);
                }
            });
            setAnnouncements(response.announcements.reverse());
        });
        getGroupStarred(authentifiedUserId, groupId).then((response) => {
            setProfileStarred(response);
        });

    }, []);

    if (group === undefined) {
        return <>
        </>;
    }

    return <> 
        <div className='border-box flex-column width-full height-full' style={{boxSizing: 'border-box', paddingTop: '70px', gap: '40px'}}>
            <div className='flex-row flex-space width-full' style={{height: '230px', gap: '30px'}}>
                <div className='visible-layout height-full width-full' style={{minWidth: '0px'}}>
                    <div className='border-box height-full width-full' style={{padding: '30px 0 30px 0'}}>
                        <div className='flex-row flex-space border-box width-full height-full' style={{padding: '0 100px 0 60px', gap: '30px'}}>
                            <div className='fit-width'>
                                <div className='avatar-container'>
                                    <img className='width-full height-full' style={{objectFit: 'cover'}} alt='' src={group?.avatar_uri}></img>
                                </div>
                            </div>
                            <div className='flex-column flex-center height-full width-full' style={{gap: '5px'}}>
                                <div className='flex-row flex-space width-full'>
                                    <div className='flex-column'>
                                        <div className='first-name-text'>{group?.name}</div>
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
                                    <div className='tertiary-info'>{format(new Date(group.creation_date), 'HH:mm dd.MM.yyyy')}</div>
                                </div>
                                <div className='flex-row flex-space width-full'>
                                    <div className='tertiary-info'>Последнее изменение</div>
                                    <div className='tertiary-info'>{format(new Date(group.last_edit_date), 'HH:mm dd.MM.yyyy')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='visible-layout height-full' style={{minWidth: '340px'}}>
                    <div className='border-box flex-row width-full height-full' style={{padding: '0 35px 0 35px'}}>
                        <div className='border-box flex-column width-full height-full' style={{padding: '25px 0 25px 0', gap: '10px'}}>
                            <div className='fit-height'>
                                <div className='caption'>Жанры</div>
                            </div>
                            <div className='scroll-column' style={{gap: '10px', paddingRight: '10px'}}>
                                {
                                    group?.genres.map((genre) => {
                                        return <div>{genre}</div>
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
                                { userInGroup ?
                                    <>
                                        {/* <CustomButton className='actions-button' variant='contained' */}
                                        {/* > */}
                                        {/*     Редактировать профиль */}
                                        {/* </CustomButton> */}
                                        <CustomButton className='actions-button' variant='contained'
                                            onClick={handleLeaveClick}
                                        >
                                            Покинуть группу 
                                        </CustomButton>
                                    </>
                                    :
                                    <CustomButton className='actions-button' variant='contained'
                                        onClick={handleJoinClick}
                                    >
                                        Присоединиться
                                    </CustomButton>
                                }
                            </div>
                        </div>
                    </div>
                    { userInGroup ?
                        <PostAnnouncement 
                            author="group"
                            authorId={groupId}

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
                                        authorName={group?.first_name}
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
                            <div className='caption'>Участники</div>
                            <div className='scroll-column' style={{gap: '15px', paddingRight: '15px'}}>
                                {
                                    members.map((member) => {
                                        return <GroupMemberInfo
                                            key={member.user._key}
                                            user={member.user}
                                            joinDate={format(new Date(member.join_date), 'HH:mm dd.MM.yyyy')}
                                        />
                                    })
                                }
                                {/* <UserGroupInfo */}
                                {/*     group={{name: 'Радиолюбители', avatar_uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVfBzJ3q1OdwAUnScbjEdYUh8psz24q0meDw&s'}} */}
                                {/*     joinDate={'01.01.2020'} */}
                                {/* /> */}
                                {/* <UserGroupInfo */}
                                {/*     group={{name: 'Улыбка', avatar_uri: 'https://yt3.googleusercontent.com/aCf8WKRR9eqx0GhLLLoaDCJKRv-udsfJtX0K4xnrBBJeKPIf5jIGbzKE4kZ5lZSRVzvmjZjyCQ=s900-c-k-c0x00ffffff-no-rj'}} */}
                                {/*     joinDate={'01.01.2020'} */}
                                {/* /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};
