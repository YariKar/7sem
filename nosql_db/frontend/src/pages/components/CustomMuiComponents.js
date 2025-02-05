import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';

import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';

import TextField from '@mui/material/TextField';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

export const CustomButton = styled(Button)(() => ({
    width: '120px',
    height: '40px',

    backgroundColor: 'var(--primary-color)',
    borderRadius: '10px',

    color: 'var(--contrast-text-color)',
    fontSize: '16px',
    fontWeight: 'normal',
    textTransform: 'none'
}));

export const CustomTab = styled(Tab)(() => ({
    "&.Mui-selected": {
        color: 'var(--text-color)',
        fontWeight: 'bold'
    },
    color: 'var(--text-color)',
    borderColorBottom: 'red'
}));

export const CustomTabList = styled(TabList)(() => ({
    "& .MuiTabs-indicator": {
        backgroundColor: 'var(--primary-color)'
    }

}));

export const CustomTextField = styled(TextField)(() => ({
    "& input": {
        boxSizing: 'border-box',
        height: '23px',
        fontSize: '16px',
        padding: '0 10px',
        backgroundColor: 'var(--text-color)',
        color: 'var(--base-color)',
        borderRadius: '10px',
    },
    "& fieldset": {
        border: 'none',
        color: 'red',
    },
    "& label.Mui-focused": {
        display: "none"
    },
    "& label.MuiFormLabel-filled": {
        display: "none"
    },
    "& label": {
        transform: 'translate(12px, 20%) scale(0.75)'
    }
}));

export const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export const CustomDatePicker = styled(DatePicker)(() => ({
    "& .MuiInputBase-input": {
        height: '23px',
        fontSize: '16px',
        padding: '0 10px',
        backgroundColor: 'var(--text-color)',
        color: 'var(--base-color)',
        borderRadius: '10px',
    },
    "& fieldset": {
        border: 'none',
        color: 'red',
    },
    "& label.Mui-focused": {
        display: "none"
    },
    "& label.MuiFormLabel-filled": {
        display: "none"
    },
    "& label": {
        transform: 'translate(12px, 30%) scale(0.75)'
    },
    svg: {
        color: 'var(--primary-color)'
    }
}));

export const CustomSelect = styled(Select)(() => ({
    "& .MuiSelect-icon": {
        color: 'var(--base-color)'
    },
    "& .MuiOutlinedInput-notchedOutline": {
        border: 'none',
        color: 'red',
    },
    "& fieldset": {
        border: 'none',
        color: 'red',
    },
    "& .MuiInputBase-input": {
        height: '23px',
        fontSize: '16px',
        padding: '0 10px',
        backgroundColor: 'var(--text-color)',
        color: 'var(--base-color)',
        borderRadius: '10px !important',
    },
    "&.Mui-focused": {
        borderRadius: '10px',
    },
}));

export function Dropdown(props) {
    return <>
        <FormControl>
            <InputLabel
                sx={{
                    transform: 'translate(12px, 20%) scale(0.75)',
                    fontSize: '16px',
                    "&.Mui-focused": {
                        color: 'var(--base-color)'
                    }
                }}
            >{props.label}</InputLabel>
            <CustomSelect
                label={props.label}
                value={""}
            >
                {
                    props.children
                }
            </CustomSelect>
        </FormControl>
    </>
}
