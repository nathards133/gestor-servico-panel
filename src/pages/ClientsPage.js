import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TablePagination,
    Toolbar,
    InputAdornment,
    useTheme,
    useMediaQuery,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import api from '../config/axios';
import ClientDialog from '../components/ClientDialog';
import ConfirmDialog from '../components/ConfirmDialog';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalClients, setTotalClients] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/clients', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm
                }
            });
            
            setClients(response.data || []);
            setTotalClients(response.data?.length || 0);
            
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setError('Falha ao carregar os clientes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [page, rowsPerPage, searchTerm]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDialog = (mode, client = null) => {
        setDialogMode(mode);
        setSelectedClient(client);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedClient(null);
        setDialogMode('create');
    };

    const handleDeleteClick = (client) => {
        setSelectedClient(client);
        setOpenConfirmDialog(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/clients/${selectedClient.id}`);
            fetchClients();
            setOpenConfirmDialog(false);
            setSelectedClient(null);
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            setError('Falha ao excluir o cliente');
        }
    };

    const handleSaveClient = async (clientData) => {
        try {
            await api.post('/api/clients', clientData);
            fetchClients();
            handleCloseDialog();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            setError('Falha ao salvar o cliente');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                Clientes
            </Typography>

            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Buscar clientes..."
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: isMobile ? '100%' : '300px' }}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('create')}
                >
                    Novo Cliente
                </Button>
            </Toolbar>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nome</TableCell>
                                    {!isMobile && (
                                        <>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Telefone</TableCell>
                                            <TableCell>Cidade</TableCell>
                                        </>
                                    )}
                                    <TableCell align="right">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>{client.name}</TableCell>
                                        {!isMobile && (
                                            <>
                                                <TableCell>{client.email}</TableCell>
                                                <TableCell>{client.phone}</TableCell>
                                                <TableCell>{client.address?.city}</TableCell>
                                            </>
                                        )}
                                        <TableCell align="right">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog('edit', client)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(client)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton
                                                color="info"
                                                onClick={() => handleOpenDialog('view', client)}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={totalClients}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}

            <ClientDialog
                open={openDialog}
                onClose={handleCloseDialog}
                onSave={handleSaveClient}
                client={selectedClient}
                mode={dialogMode}
            />
        </Box>
    );
};

export default ClientsPage; 