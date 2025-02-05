import './AnnouncementsList.css';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import Pagination from '../components/pagination/Pagination.js';
import { CustomTextField, CustomButton, CustomDatePicker } from '../components/CustomMuiComponents.js';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getAnnouncements } from '../../requests/Requests.js';
import Announcement from '../components/announcement/Announcement.js';

export default function AnnouncementsList(props) {

    const [searchParams, setSearchParams] = useSearchParams();

    const pageSize = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [announcements, setAnnouncements] = useState([]);

    const [filterAuthor, setFilterAuthor] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterStarsFrom, setFilterStarsFrom] = useState('');
    const [filterStarsTo, setFilterStarsTo] = useState('');
    const [filterTag, setFilterTag] = useState('');

    const handleFilter = (event) => {
        const filter = {
            producer: filterAuthor,
            from_date: filterDateFrom,
            to_date: filterDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo,
            tag: filterTag
        };
        getAnnouncements(currentPage, pageSize, filter).then((response) => {
            setAnnouncements(response.announcement_list);
        });
    }

    useEffect(() => {
        setSearchParams({page: currentPage, page_size: pageSize});
        const filter = {
            producer: filterAuthor,
            from_date: filterDateFrom,
            to_date: filterDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo,
            tag: filterTag
        };
        getAnnouncements(currentPage, pageSize, filter).then((response) => {
            setAnnouncements(response.announcement_list);
            setTotalPages(Math.ceil(response.count / pageSize));
        });
    }, [currentPage]);

    const handlePreviousClick = (event) => {
        if (currentPage === 1) {
            toast('Ты уже на первой странице!'); 
            return;
        }
        setCurrentPage(currentPage - 1);
    }

    const handleNextClick = (event) => {
        if (currentPage === totalPages) {
            toast('Ты уже на последней странице!'); 
            return;
        }
        setCurrentPage(currentPage + 1);
    }

    return <>
        <div className='flex-row width-full' style={{gap: '20px'}}>
            <Pagination
                pageNumber={currentPage}
                totalPages={totalPages}
                onPreviousClick={handlePreviousClick}
                onNextClick={handleNextClick}
            >
                {
                    announcements.map((announcement) => {
                        return <Announcement
                            key={announcement.announcement._key}
                            announcementId={announcement.announcement._key}
                            authorName={announcement.sender.first_name == undefined ? announcement.sender.name : announcement.sender.first_name}
                            tag={announcement.announcement.tag}
                            date={format(new Date(announcement.announcement.creation_date), 'HH:mm dd.MM.yyyy')}
                            content={announcement.announcement.content}
                            starsAmount={announcement.stars.length}
                        />
                    })
                }
            </Pagination>
            <div className='flex-column fit-width' style={{paddingTop: '80px', gap: '20px'}}>
                <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px', maxWidth: '340px'}}>
                    <div className='caption'>Фильтрация</div>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Автор</div>
                    <CustomTextField sx={{width: '100%'}} label="Автор" value={filterAuthor} onChange={(event) => {setFilterAuthor(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Тег</div>
                    <CustomTextField sx={{width: '100%'}} label="Тег" value={filterTag} onChange={(event) => {setFilterTag(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Число звезд</div>
                    <div
                        className='flex-row width-full flex-space'
                        style={{gap: '5px'}}
                    >
                        <CustomTextField type="number" label="От" value={filterStarsFrom} onChange={(event) => {setFilterStarsFrom(event.target.value)}}/>
                        <CustomTextField type="number" label="До" value={filterStarsTo} onChange={(event) => {setFilterStarsTo(event.target.value)}}/>

                    </div>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата публикации</div>
                    <div
                        className='flex-column width-full flex-space'
                        style={{gap: '5px'}}
                    >
                        <CustomDatePicker label="От" onChange={(event) => {setFilterDateFrom(event)}}></CustomDatePicker>
                        <CustomDatePicker label="До" onChange={(event) => {setFilterDateTo(event)}}></CustomDatePicker>
                    </div>
                    <CustomButton variant='contained' sx={{alignSelf: 'end'}} onClick={handleFilter}>Применить</CustomButton>
                </div>
            </div>
        </div>
    </>;
}
