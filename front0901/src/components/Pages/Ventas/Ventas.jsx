import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material';
import Page from '../../common/Page';
import ApiRequest from '../../../helpers/axiosInstances';
import ToastAutoHide from '../../common/ToastAutoHide';
import { transformDate } from '../../../helpers/utils';
import * as XLSX from 'xlsx'; // Importa la biblioteca xlsx

const Ventas = () => {
    const initialState = { objeto: '', descripcion: '', fecha: transformDate(new Date()), vendedor_nombre: '', cliente_nombre: '', monto: '' };
    const [proyectosList, setProyectosList] = useState([]);
    const [page, setPage] = useState(0);
    const [body, setBody] = useState(initialState);
    const [openDialog, setOpenDialog] = useState(false);
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null });
    const tableRef = useRef(null); // Referencia para la tabla oculta

    const handleDialog = () => {
        setOpenDialog(prev => !prev);
    };

    const handlePage = (event, newPage) => {
        setPage(newPage - 1);
    };

    const getProyectos = async () => {
        try {
            const { data } = await ApiRequest().get('/proyectos');
            setProyectosList(data);
        } catch (error) {
            console.log(error);
        }
    };

    const onChange = ({ target: { name, value } }) => {
        setBody({ ...body, [name]: value });
    };

    const submitProyecto = async () => {
        try {
            const { data } = await ApiRequest().post('/proyectos/guardar', body);
            handleDialog();
            getProyectos();
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
            setBody(initialState);
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            });
        }
    };

    const deleteProyecto = async (id) => {
        try {
            const { data } = await ApiRequest().post('/proyectos/eliminar', { id });
            getProyectos();
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            });
        }
    };

    const exportToExcel = () => {
        // Crear un array de arrays con los datos
        const data = [
            // Encabezados en negrita
            [
                { v: 'ID', t: 's', s: { font: { bold: true } } },
                { v: 'Objeto', t: 's', s: { font: { bold: true } } },
                { v: 'Descripción', t: 's', s: { font: { bold: true } } },
                { v: 'Fecha', t: 's', s: { font: { bold: true } } },
                { v: 'Vendedor', t: 's', s: { font: { bold: true } } },
                { v: 'Cliente', t: 's', s: { font: { bold: true } } },
                { v: 'Monto', t: 's', s: { font: { bold: true } } },
            ],
            // Datos de las ventas
            ...proyectosList.map((item) => [
                item.id,
                item.objeto,
                item.descripcion,
                item.fecha,
                item.vendedor_nombre,
                item.cliente_nombre,
                item.monto,
            ]),
        ];

        // Crear la hoja de cálculo
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, "Ventas.xlsx");
    };

    useEffect(getProyectos, []);

    return (
        <Page title="SELLER | Ventas">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nueva venta</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <TextField name='objeto' margin='normal' size='small' value={body.objeto} color='primary' variant='outlined' fullWidth label='Objeto' onChange={onChange} />
                        <TextField name='monto' margin='normal' size='small' value={body.monto} color='primary' variant='outlined' fullWidth label='Monto' onChange={onChange} />
                        <TextField name='fecha' margin='normal' size='small' value={body.fecha} color='primary' variant='outlined' fullWidth label='Fecha (YYYY-MM-DD)' onChange={onChange} />
                        <TextField name='vendedorNombre' margin='normal' size='small' value={body.vendedorNombre} color='primary' variant='outlined' fullWidth label='Vendedor' onChange={onChange} />
                        <TextField name='clienteNombre' margin='normal' size='small' value={body.clienteNombre} color='primary' variant='outlined' fullWidth label='Cliente' onChange={onChange} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='secondary' onClick={handleDialog}>Cancelar</Button>
                    <Button variant='contained' color='primary' onClick={submitProyecto}>Añadir venta</Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="lg">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h5">Lista de ventas</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir venta</Button>
                    </Grid>
                    {proyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
                        <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
                            <ProyectosCard
                                id={item.id}
                                imagen="https://www.creativefabrica.com/wp-content/uploads/2021/06/13/Earning-Sales-Growth-Icon-Graphics-13339632-1.jpg"
                                objeto={item.objeto}
                                descripcion={item.descripcion}
                                fecha={item.fecha}
                                vendedor_nombre={item.vendedor_nombre}
                                cliente_nombre={item.cliente_nombre}
                                monto={item.monto}
                                actionDelete={() => deleteProyecto(item.id)}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        {/* Tabla oculta para exportar */}
                        <table ref={tableRef} style={{ display: 'none' }}>
                            <thead>
                                <tr>
                                    <th>Objeto</th>
                                    <th>Descripción</th>
                                    <th>Fecha</th>
                                    <th>Vendedor</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proyectosList.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.objeto}</td>
                                        <td>{item.descripcion}</td>
                                        <td>{item.fecha}</td>
                                        <td>{item.vendedor_nombre}</td>
                                        <td>{item.cliente_nombre}</td>
                                        <td>{item.monto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación y botón de exportar */}
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                            <Pagination count={Math.ceil(proyectosList.length / 10)} color="primary" onChange={handlePage} />
                            <Button variant="contained" color="success" onClick={exportToExcel}>Exportar a Excel</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
};

const ProyectosCard = ({ id, imagen, objeto, descripcion, fecha, vendedor_nombre, cliente_nombre, monto, actionDelete }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Proyecto" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{objeto}</Typography>
            <Typography variant="body2">{descripcion}</Typography>
            <Typography variant="body2"><strong>Fecha:</strong> {fecha}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {vendedor_nombre}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {cliente_nombre}</Typography>
            <Typography variant="body2"><strong>Monto:</strong> {monto}$</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
        </Box>
    );
};

export default Ventas;