import { format } from 'date-fns';
import React, { useState, useEffect, useContext } from 'react';

import { UserContext } from '../../../contexts/UserContext.js';
import { CustomTextField, CustomButton, CustomDatePicker } from '../CustomMuiComponents.js';

import { ReactComponent as SendIcon } from './assets/send.svg';

import { getComments, postComment } from '../../../requests/Requests.js';

export default function Comments(props) {

    const [authentifiedUserId, setAuthentifiedUserId] = useContext(UserContext);
    const [comments, setComments] = useState([]);

    const [comment, setComment] = useState('');

    useEffect(() => {
        getComments(props.announcementId).then((response) => {
            setComments(response.reverse());
        })
    }, []);

    return <>
        <div
            className='visible-layout flex-column width-full height-full border-box'
            style={{
                gap: '5px',
                padding: '20px 10px 20px 20px'
            }}
        >
            <div
                style={{
                    fontSize: '20px',
                    color: 'var(--text-color)',
                }}
            >
                Комментарии ({comments.length})
            </div>
            <div
                className='scroll-column'
                style={{
                    gap: '5px'
                }}
            >
                {comments.map((comment) => 
                    <div
                        key={comment.comment._key}
                        className='flex-column'
                    >
                        <div
                            className='flex-row flex-space text'
                        >
                            <div
                                style={{
                                    fontSize: '24px'
                                }}
                            >
                                {comment.sender.first_name}
                            </div>
                            <div
                                style={{
                                    color: 'var(--tertiary-color)',
                                    fontSize: '12px'
                                }}
                            >
                                {format(new Date(comment.comment.creation_date), 'HH:mm dd.MM.yyyy')}
                            </div>
                        </div>
                        <div
                            className='text'
                            style={{
                                fontSize: '12px'
                            }}
                        >
                            {comment.comment.content.content}
                        </div>
                    </div>
                )}
            </div>
            <div
                className='flex-row flex-space align-center'
            >
                <CustomTextField
                    value={comment}
                    onChange={(event) => {
                        setComment(event.target.value);
                    }}
                />
                <SendIcon
                    onClick={() => {
                        setComment('');
                        postComment(authentifiedUserId, props.announcementId, comment).then((response) => {
                            getComments(props.announcementId).then((response) => {
                                setComments(response.reverse());
                            })
                        });
                    }}
                />
            </div>
        </div>
    </>;
}
