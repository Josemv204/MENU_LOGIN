import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material'
import Page from '../../common/Page'
import ApiRequest from '../../../helpers/axiosInstances'
// ----------------------------------------------------------------------
import ToastAutoHide from '../../common/ToastAutoHide'
import { transformDate } from '../../../helpers/utils'

const Presupuestos = () => {
    const initialState = { objeto: '', descripcion: '', fecha: transformDate(new Date()), vendedor_nombre: '', cliente_nombre: '', monto: '' }
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
            const { data } = await ApiRequest().get('/presupuestos')
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
            const { data } = await ApiRequest().post('/presupuestos/guardar', body)
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
        try {
            const { data } = await ApiRequest().post('/presupuestos/eliminar', { id: id })
            getProyectos()
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            })
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            })
        }
    }
    

    useEffect(getProyectos, [])

    return (
        <Page title="SELLER | Presupuestos">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nueva venta</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <TextField
                            name='objeto'
                            margin='normal'
                            size='small'
                            value={body.objeto}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Objeto'
                            onChange={onChange}
                        />
                        <TextField
                            name='monto'
                            margin='normal'
                            size='small'
                            value={body.monto}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Monto'
                            onChange={onChange}
                        />
                        <TextField
                            name='fecha'
                            margin='normal'
                            size='small'
                            value={body.fecha}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Fecha (YYYY-MM-DD)'
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
                    <Button variant='contained' color='primary' onClick={submitProyecto}>Añadir presupuesto</Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="lg">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h5">Lista de Presupuestos</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir presupuesto</Button>
                    </Grid>
                    <Grid item xs={12} sm={8} />
                    {proyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
    <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
        <ProyectosCard
            id={item.id}  // Pasar el ID al componente
            imagen="https://img.freepik.com/vector-premium/ilustracion-vector-prueba-trabajo-examen_138676-243.jpg?semt=ais_hybrid"
            objeto={item.objeto}
            descripcion={item.descripcion}
            fecha={item.fecha}
            vendedor_nombre={item.vendedor_nombre}
            cliente_nombre={item.cliente_nombre}
            monto={item.monto}
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

const ProyectosCard = ({ id, imagen, objeto, descripcion, fecha, vendedor_nombre, cliente_nombre, monto, actionDelete }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Proyecto" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{objeto}</Typography>
            <Typography variant="body2">{descripcion}</Typography>
            <Typography variant="body2"><strong>Fecha:</strong> {fecha}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {vendedor_nombre}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {cliente_nombre}</Typography>
            <Typography variant="body2"><strong>Monto:</strong> {monto}Bs</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
        </Box>
    );
};

export default Presupuestos
