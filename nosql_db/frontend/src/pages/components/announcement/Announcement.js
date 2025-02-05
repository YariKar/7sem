import './Announcement.css';

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';
import Popover from '@mui/material/Popover';

import SelectTag from '../selecttag/SelectTag.js';
import { UserContext } from '../../../contexts/UserContext.js';

import { getAnnouncementStarred, addStarToAnnouncement, getComments } from '../../../requests/Requests.js';
import Comments from '../comments/Comments.js';

import { ReactComponent as StarIcon } from './assets/star.svg';

const CustomSmallButton = styled(Button)(() => ({
    width: '94px',
    height: '20px',

    backgroundColor: 'var(--primary-color)',
    borderRadius: '10px',

    whiteSpace: 'nowrap',

    color: 'var(--contrast-text-color)',
    fontSize: '10px',
    fontWeight: 'normal',
    textTransform: 'none'
}));

export default function Announcement(props) {

    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);
    const [announcementStarred, setAnnouncementStarred] = useState(false);
    const [starsAmount, setStarsAmount] = useState(props.starsAmount);

    const [anchorEl, setAnchorEl] = useState(null);
    const [commentsAmount, setCommentsAmount] = useState(0);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        getAnnouncementStarred(authentifiedUserId, props.announcementId).then((response) => {
            setAnnouncementStarred(response);
        });
        getComments(props.announcementId).then((response) => {
            setCommentsAmount(response.length);
        })
    }, []);

    const handleStarClick = (event) => {
        if (announcementStarred) {
            addStarToAnnouncement(authentifiedUserId, props.announcementId).then((response) => {
                setAnnouncementStarred(false);
                setStarsAmount(Number(starsAmount) - 1);
            });
        } else {
            addStarToAnnouncement(authentifiedUserId, props.announcementId).then((response) => {
                setAnnouncementStarred(true);
                setStarsAmount(Number(starsAmount) + 1);
            });
        }
    }

    return <>
        <div>
            <div className='visible-layout flex-column width-full' style={{height: 'fit-content', padding: '10px 0 10px 0', gap: '10px'}}>
                <div className='border-box flex-row width-full flex-space' style={{padding: '0 20px 0 20px'}}>
                    <div className='flex-row' style={{gap: '20px'}}>
                        <div className='author-name'>
                            Автор: {props.authorName}
                        </div>
                        <SelectTag 
                            value={props.tag}
                            disabled={true}
                        />
                        <NavLink to={`/announcements/${props.announcementId}`} style={{textDecoration: 'none'}}>
                            <div className='author-name'>
                                Просмотр
                            </div>
                        </NavLink>
                    </div>
                    <div className='announcement-date'>
                        {props.date}
                    </div>
                </div>
                <div className='border-box flex-row width-full flex-space align-start' style={{padding: '0 20px 0 20px'}}>
                    <div className='annoncement-content width-full'>
                        {props.content}
                    </div>
                    <div className='flex-row align-center flex-center' style={{gap: '5px'}}>
                        <div className='announcement-stars-count'>{starsAmount}</div>
                        <StarIcon
                            style={{
                                stroke: 'var(--primary-color)', 
                                fill: announcementStarred ? 'var(--primary-color)' : 'none'
                            }}
                            onClick={handleStarClick}
                        />
                    </div> 
                </div>
                <div className='flex-row border-box width-full flex-end' style={{padding: '0 20px 0 40px'}}>
                    <CustomSmallButton
                        className='actions-button'
                        variant='contained'
                        aria-describedby={id}
                        onClick={(event) => {
                            toast("Комментарии теперь доступны!");
                            handleOpen(event);
                        }}
                    >
                        Комментарии ({commentsAmount})
                    </CustomSmallButton>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <div
                            className='visible-layout border-box'
                            style={{
                                width: '300px',
                                height: '300px'
                            }}
                        >
                            <Comments
                                announcementId={props.announcementId}
                            />
                        </div>
                    </Popover>
                </div>
            </div>
        </div>
    </>;
}
