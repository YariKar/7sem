import './Statistic.css';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@mui/material/Button';

import { importData, exportData } from '../../requests/Requests.js';

import { CustomButton, VisuallyHiddenInput, CustomTab, CustomTabList } from '../../pages/components/CustomMuiComponents.js';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import { getStatistics } from '../../requests/Requests.js';

import GroupItem from '../components/groupitem/GroupItem.js';
import Diagrams from '../components/diagrams/Diagrams.js';
import UserItem from '../components/useritem/UserItem.js';
import Announcement from '../components/announcement/Announcement.js';
import { format } from 'date-fns';

export default function Statistic(props) {

    const [overlayVisible, setOverlayVisible] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        importData(formData).then((response) => {
            setOverlayVisible(true);
            toast.success(`Ура, данные импортированы! Записей: ${response.number_of_records}! 🎉\n Приложение будет перезагружено через 5 секунд..`);
            setTimeout(() => {
                localStorage.removeItem('userId');
                window.location.href = '/';
            }, 5000);
        });
    }

    const handleFileDownload = (event) => {
        exportData();
    } 

    const [tab, setTab] = React.useState('1');

    const handleChangeTab = (event, newTab) => {
        setTab(newTab);
    };

    const [statistic, setStatistic] = useState(undefined);

    useState(() => {
        getStatistics().then((response) => {
            setStatistic(response);
        });
    }, []);

    const renderStatistics = () => {
        if (statistic === undefined) {
            return <></>;
        }
        return <>
            <div
                className='width-full flex-column border-box'
                style={{
                    gap: '20px'
                }}
            >
                <div
                    className='width-full flex-row border-box'
                    style={{
                        gap: '10px'
                    }}
                >
                    <div
                        className='visible-layout important-text'
                        style={{
                            padding: '10px'
                        }}
                    >
                        Самая популярная группа
                    </div>
                    <GroupItem
                        key={statistic.popular_group.group._key}
                        groupId={statistic.popular_group.group._key}
                        name={statistic.popular_group.group.name}
                        creationDate={format(new Date(statistic.popular_group.group.creation_date), 'HH:mm dd.MM.yyyy')}
                        lastEditDate={format(new Date(statistic.popular_group.group.last_edit_date), 'HH:mm dd.MM.yyyy')}
                        avatarUri={statistic.popular_group.group.avatar_uri}
                        genres={statistic.popular_group.group.genres}
                        stars={statistic.popular_group.stars}
                        members={[]}
                    />
                </div>
                <div
                    className='width-full flex-row border-box'
                    style={{
                        gap: '10px'
                    }}
                >
                    <div
                        className='visible-layout important-text'
                        style={{
                            padding: '10px'
                        }}
                    >
                        Самый популярный пользователь
                    </div>
                    <UserItem
                        key={statistic.popular_user.user._key}
                        userId={statistic.popular_user.user._key}
                        firstName={statistic.popular_user.user.first_name}
                        lastName={statistic.popular_user.user.last_name}
                        creationDate={format(new Date(statistic.popular_user.user.creation_date), 'HH:mm dd.MM.yyyy')}
                        lastEditDate={format(new Date(statistic.popular_user.user.last_edit_date), 'HH:mm dd.MM.yyyy')}
                        avatarUri={statistic.popular_user.user.avatar_uri}
                        stars={statistic.popular_user.stars}
                        talents={statistic.popular_user.user.talents}
                    />
                </div>
                <div
                    className='width-full flex-row border-box'
                    style={{
                        gap: '10px'
                    }}
                >
                    <div
                        className='visible-layout important-text'
                        style={{
                            padding: '10px'
                        }}
                    >
                        Самое популярное объявление
                    </div>
                    <Announcement
                        key={statistic.popular_announcement.announcement._key}
                        announcementId={statistic.popular_announcement.announcement._key}
                        // authorName={statistic.popular_announcement.sender.first_name == undefined ? announcement.sender.name : announcement.sender.first_name}
                        tag={statistic.popular_announcement.announcement.tag}
                        date={format(new Date(statistic.popular_announcement.announcement.creation_date), 'HH:mm dd.MM.yyyy')}
                        content={statistic.popular_announcement.announcement.content}
                        starsAmount={statistic.popular_announcement.stars}
                    />
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего пользователей: {statistic.user_count}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего групп: {statistic.group_count}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего объявлений: {statistic.announcement_count}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего мест: {statistic.place_count}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего звезд: {statistic.all_stars}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего звезд у пользователей: {statistic.user_stars}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего звезд у групп: {statistic.group_stars}
                </div>
                <div
                    className='visible-layout important-text'
                    style={{
                        padding: '10px'
                    }}
                >
                   Всего звезд у объявлений: {statistic.announcement_stars}
                </div>
            </div>
        </>;
    }

    return <>
        <div
            className='width-full height-full'
            style={{
                display: overlayVisible ? 'flex' : 'none',
                position: 'fixed',
                top: '0',
                left: '0',
                zIndex: '1000',
            }}
        >
        </div>
        <div
            className='width-full height-full flex-column border-box'
            style={{
                padding: '30px 0 0 0'
            }}
        >
            <TabContext
                value={tab}
            >
                <div
                    className='width-full flex-row border-box visible-layout flex-space align-center'
                    style={{
                        padding: '0 30px 0 30px',
                        height: '50px'
                    }}
                >
                    <div>
                        <CustomTabList onChange={handleChangeTab}>
                            <CustomTab label="Данные" value="1" />
                            <CustomTab label="Диаграммы" value="2" />
                        </CustomTabList>
                    </div>

                    <div
                        className='flex-row'
                        style={{
                            gap: '10px'
                        }}
                    >
                        <CustomButton
                            component='label'
                            sx={{
                                width: '142px',
                                height: '30px',
                                fontSize: '10px'
                            }}
                        >
                            Импортировать данные
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleFileUpload}
                            />
                        </CustomButton>
                        <CustomButton
                            sx={{
                                width: '142px',
                                height: '30px',
                                fontSize: '10px'
                            }}
                            onClick={handleFileDownload}
                        >Экспортировать данные</CustomButton>
                    </div>
                </div>
                <TabPanel value="1">
                    {renderStatistics()}
                </TabPanel>
                <TabPanel value="2">
                    <Diagrams>

                    </Diagrams>
                </TabPanel>
            </TabContext>
        </div> 
    </>;
}
