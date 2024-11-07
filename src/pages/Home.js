/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Card,
    CardContent,
    Grid,
    Chip,
    useTheme,
    useMediaQuery,
    Fab,
    Dialog,
    TextField,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../config/axios';

const ServiceOrderDashboard = () => {
    const [serviceOrders, setServiceOrders] = useState([]);
    const [openNewOrder, setOpenNewOrder] = useState(false);
    const [selectedClient, setSelectedClient] = useState('');
    const [clients, setClients] = useState([]);
    const [description, setDescription] = useState('');
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Estatísticas
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        expectedRevenue: 0,
        actualRevenue: 0,
        monthlyStats: {
            ordersThisMonth: 0,
            revenueThisMonth: 0,
            growthRate: 0
        },
        popularServices: [],
        recentActivity: [],
        quotationStats: {
            total: 0,
            thisMonth: 0,
            approved: 0,
            pending: 0,
            totalValue: 0
        },
        quotes: []
    });

    // Adicionar estado para filtro de orçamentos
    const [quoteFilter, setQuoteFilter] = useState('all');

    // Função para filtrar orçamentos
    const filteredQuotes = useMemo(() => {
        if (quoteFilter === 'all') return stats.quotes;
        return stats.quotes.filter(quote => quote.status === quoteFilter);
    }, [stats.quotes, quoteFilter]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await api.get('/api/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            showSnackbar('Erro ao carregar estatísticas', 'error');
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleCreateOrder = async () => {
        try {
            await api.post('/api/service-orders', {
                clientId: selectedClient,
                description,
                status: 'pending'
            });
            setOpenNewOrder(false);
            fetchDashboardData();
            showSnackbar('Ordem de serviço criada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar ordem de serviço:', error);
            showSnackbar('Erro ao criar ordem de serviço', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Estatísticas Principais */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography variant="h6">Total de Ordens</Typography>
                            <Typography variant="h4">{stats.totalOrders}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.monthlyStats.ordersThisMonth} este mês
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: '#f3e5f5' }}>
                        <CardContent>
                            <Typography variant="h6">Ordens Pendentes</Typography>
                            <Typography variant="h4">{stats.pendingOrders}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {stats.completedOrders} ordens concluídas
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Serviços Mais Populares */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Serviços Mais Solicitados
                            </Typography>
                            <List>
                                {stats.popularServices.map((service, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={service.name}
                                            secondary={`${service.count} pedidos`}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            {service.percentage}%
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Atividades Recentes */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Atividades Recentes
                            </Typography>
                            <List>
                                {stats.recentActivity.map((activity, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={activity.description}
                                            secondary={format(new Date(activity.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        />
                                        <Chip
                                            label={activity.type}
                                            size="small"
                                            color={activity.type === 'completed' ? 'success' : 'default'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Novo Card de Orçamentos */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: '#fce4ec' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Orçamentos
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Total do Mês
                                    </Typography>
                                    <Typography variant="h4">
                                        {stats.quotationStats.thisMonth}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Valor Total
                                    </Typography>
                                    <Typography variant="h6">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(stats.quotationStats.totalValue)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Aprovados
                                    </Typography>
                                    <Typography variant="body1" color="success.main">
                                        {stats.quotationStats.approved}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Pendentes
                                    </Typography>
                                    <Typography variant="body1" color="warning.main">
                                        {stats.quotationStats.pending}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Taxa de Aprovação: {
                                        stats.quotationStats.total > 0
                                            ? Math.round((stats.quotationStats.approved / stats.quotationStats.total) * 100)
                                            : 0
                                    }%
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Seção de Orçamentos Detalhados */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Orçamentos Recentes
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    value={quoteFilter}
                                    onChange={(e) => setQuoteFilter(e.target.value)}
                                    sx={{ width: 150 }}
                                >
                                    <MenuItem value="all">Todos</MenuItem>
                                    <MenuItem value="pending">Pendentes</MenuItem>
                                    <MenuItem value="approved">Aprovados</MenuItem>
                                    <MenuItem value="rejected">Rejeitados</MenuItem>
                                </TextField>
                            </Box>
                            <List>
                                {filteredQuotes.map((quote, index) => (
                                    <ListItem
                                        key={quote.id}
                                        divider={index < filteredQuotes.length - 1}
                                        secondaryAction={
                                            <Chip
                                                label={quote.status === 'pending' ? 'Pendente' : 
                                                       quote.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                                                color={quote.status === 'pending' ? 'warning' : 
                                                      quote.status === 'approved' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle1">
                                                        {quote.clientName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
                                                        }).format(quote.totalValue)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {format(new Date(quote.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                                    </Typography>
                                                    <Typography variant="body2" noWrap>
                                                        {quote.description}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog para Nova Ordem */}
            <Dialog open={openNewOrder} onClose={() => setOpenNewOrder(false)} maxWidth="sm" fullWidth>
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Nova Ordem de Serviço
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        label="Cliente"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        sx={{ mb: 2 }}
                    >
                        {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                                {client.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descrição do Serviço"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleCreateOrder}
                        disabled={!selectedClient || !description}
                    >
                        Criar Ordem de Serviço
                    </Button>
                </Box>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ServiceOrderDashboard;