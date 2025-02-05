import './SelectTag.css';

import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { TagsContext } from '../../../contexts/TagsContext.js';

const CustomSelect = styled(Select)(() => ({
    width: 'fit-content',
    height: '20px',

    borderRadius: '5px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'var(--primary-color)',

    color: 'var(--tertiary-text-color)',
    fontSize: '12px',
    fontWeight: 'normal'
}));

export default function PostAnnouncement(props) {

    const tags = useContext(TagsContext);

    return <>
        <CustomSelect
            value={props.value}
            onChange={props.onChange}
            IconComponent={() => null}
            inputProps={{ sx: { paddingRight: '14px !important' } }}
            autoWidth
            displayEmpty
            disabled={props.disabled}
            sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'var(--tertiary-text-color)',
                },
            }}
        >
            <MenuItem value=''>
                Выберите тэг...
            </MenuItem>
            {tags.map((tag) => {
                return <MenuItem key={tag} value={tag}>{tag}</MenuItem>;
            })}
        </CustomSelect>
    </>;
}
