import React, { useState, useEffect } from 'react';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Container, Typography, Grid, Box, Button, Stack, Avatar, IconButton, Divider, Autocomplete } from '@mui/material';
import ApiRequest from '../../../helpers/axiosInstances';
import { AddOutlined, EditOutlined, DeleteOutline } from '@mui/icons-material';
import Page from '../../common/Page';
import ToastAutoHide from '../../common/ToastAutoHide';
import CommonTable from '../../common/CommonTable';

const Clientes = () => {
    const initialState = {
        avatar: '',
        nombre: "",
        apellido: "",
        empresa: "",
        contacto: "",
        vendedor_af: ""
    };
    const [clientesList, setClientesList] = useState([]);
    const [vendedores, setVendedores] = useState([]); // Estado para almacenar la lista de vendedores
    const [body, setBody] = useState(initialState);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null });

    // Obtener la lista de clientes
    const init = async () => {
        const { data } = await ApiRequest().get('/clientes');
        setClientesList(data);
    };

    // Obtener la lista de vendedores
    const getVendedores = async () => {
        try {
            const { data } = await ApiRequest().get('/usuarios'); // Ajusta la ruta según tu API
            setVendedores(data.map(item => ({ nombre: item.user }))); // Mapea la columna 'user' a 'nombre'
        } catch (error) {
            console.log(error);
        }
    };

    const columns = [
        {
            field: 'avatar',
            headerName: 'Clientes',
            width: 200,
            renderCell: (params) => (
                <Avatar src={params.value} />
            )
        },
        { field: 'nombre', headerName: 'Nombre', width: 220 },
        { field: 'empresa', headerName: 'Empresa', width: 220 },
        { field: 'contacto', headerName: 'Contacto', width: 220 },
        { field: 'vendedor_af', headerName: 'Vendedor afiliado', width: 220 },
        {
            field: '',
            headerName: 'Acciones',
            width: 200,
            renderCell: (params) => (
                <Stack divider direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={2}>
                    <IconButton size='small' onClick={() => {
                        setIsEdit(true);
                        setBody(params.row);
                        handleDialog();
                    }}>
                        <EditOutlined />
                    </IconButton>
                    <IconButton size='small' onClick={() => onDelete(params.id)}>
                        <DeleteOutline />
                    </IconButton>
                </Stack>
            )
        }
    ];

    const onDelete = async (id) => {
        try {
            const { data } = await ApiRequest().post('/eliminar2', { id: id });
            setMensaje({
                ident: new Date().getTime(),
                message: data.message,
                type: 'success'
            });
            init();
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data.sqlMessage,
                type: 'error'
            });
        }
    };

    const handleDialog = () => {
        setOpenDialog(prev => !prev);
        if (!openDialog) {
            setBody(initialState); // Resetear el formulario al abrir el diálogo
            setIsEdit(false); // Asegurarse de que no esté en modo edición
        }
    };

    const onChange = ({ target }) => {
        const { name, value } = target;
        setBody({
            ...body,
            [name]: value
        });
    };

    const onSubmit = async () => {
        try {
            const { data } = await ApiRequest().post('/guardar2', body);
            handleDialog();
            setBody(initialState);
            setMensaje({
                ident: new Date().getTime(),
                message: data.message,
                type: 'success'
            });
            init();
            setIsEdit(false);
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data.sqlMessage,
                type: 'error'
            });
        }
    };

    const onEdit = async () => {
        try {
            const { data } = await ApiRequest().post('/editar2', body);
            handleDialog();
            setBody(initialState);
            setMensaje({
                ident: new Date().getTime(),
                message: data.message,
                type: 'success'
            });
            init();
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data.sqlMessage,
                type: 'error'
            });
        }
    };

    useEffect(() => {
        init();
        getVendedores(); // Obtener la lista de vendedores al cargar el componente
    }, []);

    return (
        <>
            <Dialog maxWidth='xs' open={openDialog} onClose={handleDialog}>
                <DialogTitle>
                    {isEdit ? 'Editar Cliente' : 'Crear Cliente'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Avatar src={body.avatar} />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                margin='normal'
                                name='nombre'
                                value={body.nombre}
                                onChange={onChange}
                                variant='outlined'
                                size='small'
                                color='primary'
                                fullWidth
                                label='Nombre'
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                margin='normal'
                                name='empresa'
                                value={body.empresa}
                                onChange={onChange}
                                variant='outlined'
                                size='small'
                                color='primary'
                                fullWidth
                                label='Empresa'
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                margin='normal'
                                name='contacto'
                                value={body.contacto}
                                onChange={onChange}
                                variant='outlined'
                                size='small'
                                color='primary'
                                fullWidth
                                label='Contacto'
                            />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                            {/* Autocomplete para Vendedor afiliado */}
                            <Autocomplete
                                options={vendedores}
                                getOptionLabel={(option) => option.nombre} // Usa el campo 'nombre' para mostrar en la lista
                                value={body.vendedor_af ? vendedores.find(v => v.nombre === body.vendedor_af) || null : null}
                                onChange={(event, newValue) => {
                                    setBody({ ...body, vendedor_af: newValue ? newValue.nombre : '' });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        margin='normal'
                                        name='vendedor_af'
                                        variant='outlined'
                                        size='small'
                                        color='primary'
                                        fullWidth
                                        label='Vendedor afiliado'
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant='text' color='primary' onClick={handleDialog}>Cancelar</Button>
                    <Button variant='contained' color='primary' onClick={isEdit ? onEdit : onSubmit}>Guardar</Button>
                </DialogActions>
            </Dialog>
            <Page title="SELLER | Clientes">
                <ToastAutoHide message={mensaje} />
                <Container maxWidth='lg'>
                    <Box sx={{ pb: 5 }}>
                        <Typography variant="h5">Lista de clientes</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Button onClick={handleDialog} startIcon={<AddOutlined />} variant='contained' color='primary'>Nuevo</Button>
                        </Grid>
                        <Grid item xs={12} sm={8} />
                        <Grid item xs={12} sm={12}>
                            <CommonTable data={clientesList} columns={columns} />
                        </Grid>
                    </Grid>
                </Container>
            </Page>
        </>
    );
};

export default Clientes;