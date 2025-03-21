import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material';
import Page from '../../common/Page';
import ApiRequest from '../../../helpers/axiosInstances';
import ToastAutoHide from '../../common/ToastAutoHide';
import { transformDate } from '../../../helpers/utils';
import * as XLSX from 'xlsx'; // Importa la biblioteca xlsx

const Ventas = () => {
    const initialState = { objeto: '', fecha: transformDate(new Date()), vendedor_nombre: '', cliente_nombre: '', monto: '' }; // Eliminado descripción
    const [proyectosList, setProyectosList] = useState([]);
    const [filteredProyectosList, setFilteredProyectosList] = useState([]);
    const [page, setPage] = useState(0);
    const [body, setBody] = useState(initialState);
    const [openDialog, setOpenDialog] = useState(false);
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null });
    const [selectedMonth, setSelectedMonth] = useState('');
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
            setFilteredProyectosList(data); // Inicialmente mostrar todas las ventas
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
            // Encabezados
            ["ID", "Objeto", "Fecha", "Vendedor", "Cliente", "Monto"], // Eliminado "Descripción"
            // Datos de las ventas
            ...filteredProyectosList.map((item) => [
                item.id,
                item.objeto,
                item.fecha,
                item.vendedor_nombre,
                item.cliente_nombre,
                `$${item.monto}`, // Agregar el signo $ al monto
            ]),
        ];

        // Crear la hoja de cálculo
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");

        // Aplicar estilos a los encabezados (negrita)
        if (!ws["!cols"]) ws["!cols"] = [];
        ws["!cols"][0] = { wch: 10 }; // Ancho de columna para ID
        ws["!cols"][1] = { wch: 20 }; // Ancho de columna para Objeto
        ws["!cols"][2] = { wch: 15 }; // Ancho de columna para Fecha
        ws["!cols"][3] = { wch: 20 }; // Ancho de columna para Vendedor
        ws["!cols"][4] = { wch: 20 }; // Ancho de columna para Cliente
        ws["!cols"][5] = { wch: 15 }; // Ancho de columna para Monto

        // Guardar el archivo
        XLSX.writeFile(wb, "Ventas.xlsx");
    };

    const handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        setSelectedMonth(selectedMonth);

        if (selectedMonth) {
            const filtered = proyectosList.filter(proyecto => {
                const proyectoDate = new Date(proyecto.fecha);
                const proyectoMonth = proyectoDate.getFullYear() + '-' + String(proyectoDate.getMonth() + 1).padStart(2, '0');
                return proyectoMonth === selectedMonth;
            });
            setFilteredProyectosList(filtered);
        } else {
            setFilteredProyectosList(proyectosList);
        }
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
                    {/* Botones de Añadir venta y Exportar a Excel */}
                    <Grid item xs={12} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir venta</Button>
                        <Button variant="contained" color="success" onClick={exportToExcel}>Exportar a Excel</Button>
                        <TextField
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            variant="outlined"
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    {/* Lista de ventas */}
                    {filteredProyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
                        <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
                            <ProyectosCard
                                id={item.id}
                                imagen="https://i.imgur.com/2cAjVkD.png"
                                objeto={item.objeto}
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
                                    <th>Fecha</th>
                                    <th>Vendedor</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProyectosList.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.objeto}</td>
                                        <td>{item.fecha}</td>
                                        <td>{item.vendedor_nombre}</td>
                                        <td>{item.cliente_nombre}</td>
                                        <td>{item.monto}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                            <Pagination count={Math.ceil(filteredProyectosList.length / 10)} color="primary" onChange={handlePage} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
};

const ProyectosCard = ({ id, imagen, objeto, fecha, vendedor_nombre, cliente_nombre, monto, actionDelete }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Proyecto" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{objeto}</Typography>
            <Typography variant="body2"><strong>Fecha:</strong> {fecha}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {vendedor_nombre}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {cliente_nombre}</Typography>
            <Typography variant="body2"><strong>Monto:</strong> {monto}$</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
        </Box>
    );
};

export default Ventas;