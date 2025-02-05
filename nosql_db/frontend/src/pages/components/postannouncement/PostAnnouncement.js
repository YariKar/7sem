import './PostAnnouncement.css';

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { UserContext } from '../../../contexts/UserContext.js';

import SelectTag from '../selecttag/SelectTag.js';

import { postUserAnnouncement, postGroupAnnouncement } from '../../../requests/Requests.js';

const CustomTextField = styled(TextField)(() => ({
    color: 'var(--text-color)',
}));

const CustomSmallButton = styled(Button)(() => ({
    width: '94px',
    height: '20px',

    backgroundColor: 'var(--primary-color)',
    borderRadius: '10px',

    color: 'var(--contrast-text-color)',
    fontSize: '10px',
    fontWeight: 'normal',
    textTransform: 'none'
}));

export default function PostAnnouncement(props) {

    const navigate = useNavigate();
    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);
    const [selectedTag, setSelectedTag] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');

    return <>
        <div className='border-box visible-layout flex-column width-full' style={{height: 'fit-content', padding: '10px 0 16px 0', gap: '10px'}}>
            <div className='border-box width-full' style={{padding: '0 20px 0 40px'}}>
                <SelectTag 
                    onChange={(event) => {
                        setSelectedTag(event.target.value);
                    }}
                    value={selectedTag}
                    disabled={false}
                />
            </div>
            <div className='border-box width-full' style={{padding: '0 20px 0 40px'}}>
                <CustomTextField
                    placeholder="Напишите содержимое объявления..."
                    fullWidth
                    InputProps={{ disableUnderline: true, style: { color: "var(--text-color)", fontSize: '12px', fontWeight: 'normal' } }}
                    multiline
                    rows={2}
                    variant="standard"
                    value={announcementContent}
                    onChange={(event) => {
                        setAnnouncementContent(event.target.value);
                    }}
                />
            </div>
            <div className='flex-row border-box width-full flex-end' style={{padding: '0 20px 0 40px'}}>
                <CustomSmallButton
                    className='actions-button'
                    variant='contained'
                    onClick={(event) => {
                        let method = () => {};
                        switch (props.author) {
                            case 'user':
                                method = postUserAnnouncement;
                                break;
                            case 'group':
                                method = postGroupAnnouncement;
                                break;
                        }
                        method(props.authorId, {
                            tag: selectedTag,
                            content: announcementContent,
                            creation_date: Date.now()
                        }).then(() => {
                            navigate(0);
                        });
                    }}
                >
                    Опубликовать
                </CustomSmallButton>
            </div>
        </div>
    </>;
}
