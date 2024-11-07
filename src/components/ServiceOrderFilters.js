import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

const ServiceOrderFilters = ({ filters, setFilters, onFilterChange }) => {
  const handleClearFilters = () => {
    setFilters({
      status: '',
      startDate: null,
      endDate: null,
      search: ''
    });
    onFilterChange();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Buscar"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            InputProps={{
              endAdornment: filters.search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="in_progress">Em Andamento</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="cancelled">Cancelado</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <DatePicker
            label="Data Inicial"
            value={filters.startDate}
            onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <DatePicker
            label="Data Final"
            value={filters.endDate}
            onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceOrderFilters; 