import './UsersList.css';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import Pagination from '../components/pagination/Pagination.js';
import { CustomTextField, CustomButton, CustomDatePicker } from '../components/CustomMuiComponents.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

import UserItem from '../components/useritem/UserItem.js';
import { getUsers } from '../../requests/Requests.js';

import { ReactComponent as BigStarIcon } from './assets/big-star.svg';

export default function UsersList(props) {

    const [searchParams, setSearchParams] = useSearchParams();

    const pageSize = 3;
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState([]);

    const [filterName, setFilterName] = useState('');
    const [filterSurname, setFilterSurname] = useState('');
    const [filterTalent, setFilterTalent] = useState('');
    const [filterGroup, setFilterGroup] = useState('');
    const [filterChangeDateFrom, setFilterChangeDateFrom] = useState('');
    const [filterChangeDateTo, setFilterChangeDateTo] = useState('');
    const [filterCreateDateFrom, setFilterCreateDateFrom] = useState('');
    const [filterCreateDateTo, setFilterCreateDateTo] = useState('');
    const [filterStarsFrom, setFilterStarsFrom] = useState('');
    const [filterStarsTo, setFilterStarsTo] = useState('');

    const handleFilter = (event) => {
        const filter = {
            first_name: filterName,
            last_name: filterSurname,
            talents: filterTalent,
            groups: filterGroup,
            from_date: filterChangeDateFrom,
            to_date: filterChangeDateTo,
            from_creation: filterCreateDateFrom,
            to_creation: filterCreateDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo
        }
        getUsers(currentPage, pageSize, filter).then((response) => {
            setUsers(response.users_list);
        });
    }

    useEffect(() => {
        setSearchParams({page: currentPage, page_size: pageSize});
        const filter = {
            first_name: filterName,
            last_name: filterSurname,
            talents: filterTalent,
            groups: filterGroup,
            from_date: filterChangeDateFrom,
            to_date: filterChangeDateTo,
            from_creation: filterCreateDateFrom,
            to_creation: filterCreateDateTo,
            from_stars: filterStarsFrom,
            to_stars: filterStarsTo
        }
        getUsers(currentPage, pageSize, filter).then((response) => {
            setUsers(response.users_list);
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
                    users.map((user) => {
                        return <UserItem
                            key={user.user._key}
                            userId={user.user._key}
                            firstName={user.user.first_name}
                            lastName={user.user.last_name}
                            creationDate={format(new Date(user.user.creation_date), 'HH:mm dd.MM.yyyy')}
                            lastEditDate={format(new Date(user.user.last_edit_date), 'HH:mm dd.MM.yyyy')}
                            avatarUri={user.user.avatar_uri}
                            stars={user.stars.length}
                            talents={user.user.talents}
                            user={user}
                        />
                    })
                }
            </Pagination>
            <div className='flex-column fit-width' style={{paddingTop: '80px', gap: '20px'}}>
                <div className='visible-layout flex-column flex-center align-start' style={{padding: '20px', gap: '12px', width: '340px'}}>
                    <div className='caption'>Фильтрация</div>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Имя</div>
                    <CustomTextField sx={{width: '100%'}} label="Имя" value={filterName} onChange={(event) => {setFilterName(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Фамилия</div>
                    <CustomTextField sx={{width: '100%'}} label="Фамилия" value={filterSurname} onChange={(event) => {setFilterSurname(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Талант</div>
                    <CustomTextField sx={{width: '100%'}} label="Талант" value={filterTalent} onChange={(event) => {setFilterTalent(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Группа</div>
                    <CustomTextField sx={{width: '100%'}} label="Группа" value={filterGroup} onChange={(event) => {setFilterGroup(event.target.value)}}/>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Число звезд</div>
                    <div
                        className='flex-row width-full flex-space'
                        style={{gap: '5px'}}
                    >
                        <CustomTextField type="number" label="От" value={filterStarsFrom} onChange={(event) => setFilterStarsFrom(event.target.value)}/>
                        <CustomTextField type="number" label="До" value={filterStarsTo} onChange={(event) => setFilterStarsTo(event.target.value)}/>

                    </div>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата изменения</div>
                    <div
                        className='flex-column width-full flex-space'
                        style={{gap: '5px'}}
                    >
                        <CustomDatePicker label="От" onChange={(event) => setFilterChangeDateFrom(event)}></CustomDatePicker>
                        <CustomDatePicker label="До" onChange={(event) => setFilterChangeDateTo(event)}></CustomDatePicker>
                    </div>
                    <div className='caption' style={{fontSize: '15px', fontWeight: 'normal'}}>Дата создания</div>
                    <div
                        className='flex-column width-full flex-space'
                        style={{gap: '5px'}}
                    >
                        <CustomDatePicker label="От" onChange={(event) => setFilterCreateDateFrom(event)}></CustomDatePicker>
                        <CustomDatePicker label="До" onChange={(event) => setFilterCreateDateTo(event)}></CustomDatePicker>
                    </div>
                    <CustomButton variant='contained' sx={{alignSelf: 'end'}} onClick={handleFilter}>Применить</CustomButton>
                </div>
            </div>
        </div>
    </>;
}
