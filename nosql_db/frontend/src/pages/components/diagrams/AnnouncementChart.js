import React, { useState, useEffect } from 'react';
import { BarChart, barElementClasses } from '@mui/x-charts/BarChart';
import MenuItem from '@mui/material/MenuItem'
import { format } from 'date-fns';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

import { CustomSelect } from '../CustomMuiComponents.js';

export default function AnnouncementChart(props) {

    const [dataset, setDataset] = useState([]);

    const [groupBy, setGroupBy] = useState('sender');
    const [valueType, setValueType] = useState('stars');

    const getEntityAttribute = (entity, attribute) => {
        switch (attribute) {
            case 'length':
                return entity.announcement?.content.length;
            case 'tag':
                return entity.announcement?.[attribute];
            case 'creation_date':
                return format(new Date(entity.announcement?.[attribute]), 'dd.MM.yyyy');
            case 'sender':
                return entity.sender?.name === undefined ? entity.sender?.first_name + ' ' + entity.sender?.last_name : entity.sender?.name;
            case 'stars':
                return entity.stars?.length;
            case 'amount':
                return 1;
        }
        return 0;
    }

    useEffect(() => {

        let correlation = new Map();

        for (let entity of props.entities) {
            let attribute = getEntityAttribute(entity, groupBy);

            if (Array.isArray(attribute)) {
                for (let item of attribute) {
                    if (correlation.has(item)) {
                        correlation.set(item, correlation.get(item) + getEntityAttribute(entity, valueType));
                    } else {
                        correlation.set(item, getEntityAttribute(entity, valueType));
                    }
                }
                continue;
            }

            if (correlation.has(attribute)) {
                correlation.set(attribute, correlation.get(attribute) + getEntityAttribute(entity, valueType));
            } else {
                correlation.set(attribute, getEntityAttribute(entity, valueType));
            }
        }

        setDataset(Array.from(correlation).map((item) => {
            return {
                label: item[0],
                value: item[1]
            }
        }));

    }, [props.entities, groupBy, valueType]);

    return <>
        <div
            className='width-full height-full flex-column border-box'
        >
            <div
                className='width-full flex-row border-box flex-center'
                style={{
                    padding: '10px',
                    gap: '10px'
                }}
            >
                <div className='text'>
                    Отобразить
                </div>
                <CustomSelect
                    value={valueType}
                    onChange={(event) => {
                        setValueType(event.target.value);
                    }}
                >
                    <MenuItem value='stars'>Звезды</MenuItem>
                    <MenuItem value='length'>Размер объявления</MenuItem>
                    <MenuItem value='amount'>Количество</MenuItem>
                </CustomSelect>
                <div className='text'>
                    в зависимости от
                </div>
                <CustomSelect
                    value={groupBy}
                    onChange={(event) => {
                        setGroupBy(event.target.value);
                    }}
                >
                    <MenuItem value='sender'>Отправитель</MenuItem>
                    <MenuItem value='tag'>Тег</MenuItem>
                    <MenuItem value='creation_date'>Дата создания</MenuItem>
                </CustomSelect>
            </div>
            <BarChart
                className='width-full'
                sx={(theme) => ({
                    [`.${barElementClasses.root}`]: {
                        fill: 'var(--primary-color)'
                    },
                    [`.${axisClasses.root}`]: {
                        [`.${axisClasses.tick}, .${axisClasses.line}`]: {
                            stroke: 'var(--text-color)'
                        },
                        [`.${axisClasses.tickLabel}`]: {
                            fill: 'var(--text-color)'
                        }
                    }
                })}
                data={dataset}
                xAxis={[{ scaleType: 'band', data: dataset.map((item) => item.label) }]}
                series={[{ data: dataset.map((item) => item.value) }]}
            />
        </div>
    </>;
}
