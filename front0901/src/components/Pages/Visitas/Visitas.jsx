import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material'
import Page from '../../common/Page'
import ApiRequest from '../../../helpers/axiosInstances'
// ----------------------------------------------------------------------
import ToastAutoHide from '../../common/ToastAutoHide'
import { transformDate } from '../../../helpers/utils'

const Visitas = () => {
    const initialState = { fecha: transformDate(new Date()), motivo: '', vendedorNombre: '', clienteNombre: '' }
    const [proyectosList, setProyectosList] = useState([])
    const [page, setPage] = useState(0)
    const [body, setBody] = useState(initialState)
    const [openDialog, setOpenDialog] = useState(false)
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null })

    const handleDialog = () => {
        setOpenDialog(prev => !prev)
    }

    const handlePage = (event, newPage) => {
        setPage(newPage - 1)
    }

    const getProyectos = async () => {
        try {
            const { data } = await ApiRequest().get('/visitas')
            setProyectosList(data)
        } catch (error) {
            console.log(error)
        }
    }

    const onChange = ({ target: { name, value } }) => {
        setBody({ ...body, [name]: value })
    }

    const submitProyecto = async () => {
        try {
            const { data } = await ApiRequest().post('/visitas/guardar', body)
            handleDialog()
            getProyectos()
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            })
            setBody(initialState)
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            })
        }
    }

    // Actualización de la función de eliminación
    const deleteProyecto = async (id) => {
        console.log("ID enviado al backend:", id); // Depuración
        try {
            const { data } = await ApiRequest().post('/visitas/eliminar', { id });
            console.log("Respuesta del servidor:", data); // Depuración
            getProyectos();
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
        } catch ({ response }) {
            console.error("Error del servidor:", response); // Depuración
            setMensaje({
                ident: new Date().getTime(),
                message: response?.data || "Error desconocido",
                type: 'error'
            });
        }
    };    

    

    useEffect(getProyectos, [])

    return (
        <Page title="SELLER | Visitas">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nueva venta</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <TextField
                            name='fecha'
                            margin='normal'
                            size='small'
                            value={body.fecha}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Fecha'
                            onChange={onChange}
                        />
                        <TextField
                            name='motivo'
                            margin='normal'
                            size='small'
                            value={body.motivo}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Motivo'
                            onChange={onChange}
                        />
                        <TextField
                            name='vendedorNombre'
                            margin='normal'
                            size='small'
                            value={body.vendedorNombre}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Vendedor'
                            onChange={onChange}
                        />
                        <TextField
                            name='clienteNombre'
                            margin='normal'
                            size='small'
                            value={body.clienteNombre}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Cliente'
                            onChange={onChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='secondary' onClick={handleDialog}>Cancelar</Button>
                    <Button variant='contained' color='primary' onClick={submitProyecto}>Añadir visita</Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="lg">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h5">Lista de Visitas</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir visita</Button>
                    </Grid>
                    <Grid item xs={12} sm={8} />
                    {proyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
    <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
        <ProyectosCard
            id={item.id}  // Asegúrate de que 'item.id' contiene el ID
            imagen="https://cdn-icons-png.flaticon.com/512/753/753114.png"
            fecha={item.fecha}
            motivo={item.motivo}
            nombre_vendedor={item.nombre_vendedor}
            nombre_cliente={item.nombre_cliente}
            actionDelete={() => deleteProyecto(item.id)}  // Enviar el ID
        />
    </Grid>
))}


                    <Grid item xs={12} sm={12}>
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <Pagination
                                count={Math.ceil(proyectosList.length / 10)}
                                color='primary'
                                onChange={handlePage} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    )
}

const ProyectosCard = ({ id, imagen, objeto, descripcion, fecha, nombre_vendedor, nombre_cliente, motivo, actionDelete }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Proyecto" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{fecha}</Typography>
            <Typography variant="body3">{motivo}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {nombre_vendedor}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {nombre_cliente}</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
        </Box>
    );
};

export default Visitas
