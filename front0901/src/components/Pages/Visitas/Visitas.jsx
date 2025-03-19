import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material';
import Page from '../../common/Page';
import ApiRequest from '../../../helpers/axiosInstances';
import ToastAutoHide from '../../common/ToastAutoHide';
import { transformDate } from '../../../helpers/utils';
import * as XLSX from 'xlsx'; // Importa la biblioteca xlsx

const Visitas = () => {
    const initialState = { fecha: transformDate(new Date()), motivo: '', vendedorNombre: '', clienteNombre: '' };
    const [proyectosList, setProyectosList] = useState([]);
    const [filteredProyectosList, setFilteredProyectosList] = useState([]); // Nuevo estado para la lista filtrada
    const [page, setPage] = useState(0);
    const [body, setBody] = useState(initialState);
    const [openDialog, setOpenDialog] = useState(false);
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null });
    const [selectedMonth, setSelectedMonth] = useState(''); // Nuevo estado para el mes seleccionado

    const handleDialog = () => {
        setOpenDialog(prev => !prev);
    };

    const handlePage = (event, newPage) => {
        setPage(newPage - 1);
    };

    const getProyectos = async () => {
        try {
            const { data } = await ApiRequest().get('/visitas');
            setProyectosList(data);
            setFilteredProyectosList(data); // Inicialmente mostrar todas las visitas
        } catch (error) {
            console.log(error);
        }
    };

    const onChange = ({ target: { name, value } }) => {
        setBody({ ...body, [name]: value });
    };

    const submitProyecto = async () => {
        try {
            const { data } = await ApiRequest().post('/visitas/guardar', body);
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

    // Función para exportar a Excel
    const exportToExcel = () => {
        try {
            // Crear un array de arrays con los datos
            const data = [
                // Encabezados
                ["ID", "Fecha", "Motivo", "Vendedor", "Cliente"],
                // Datos de las visitas
                ...filteredProyectosList.map((item) => [
                    item.id,
                    transformDate(item.fecha), // Formatear la fecha
                    { t: 's', v: item.motivo }, // Forzar el formato de texto para el motivo
                    item.nombre_vendedor,
                    item.nombre_cliente,
                ]),
            ];

            // Crear la hoja de cálculo
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Visitas");

            // Aplicar estilos a los encabezados (negrita)
            const headerStyle = { font: { bold: true }, alignment: { horizontal: 'center' } };
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                Object.assign(ws[cellAddress].s, headerStyle);
            }

            // Ajustar el ancho de las columnas
            ws['!cols'] = [
                { wch: 10 }, // Ancho de columna para ID
                { wch: 15 }, // Ancho de columna para Fecha
                { wch: 50 }, // Ancho de columna para Motivo (más ancho)
                { wch: 20 }, // Ancho de columna para Vendedor
                { wch: 20 }, // Ancho de columna para Cliente
            ];

            // Guardar el archivo
            XLSX.writeFile(wb, "Visitas.xlsx");
        } catch (error) {
            console.error("Error al exportar a Excel:", error);
            setMensaje({
                ident: new Date().getTime(),
                message: "Error al exportar a Excel",
                type: 'error'
            });
        }
    };

    // Función para manejar el cambio de mes en el calendario
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
        <Page title="SELLER | Visitas">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nueva visita</DialogTitle>
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
                    {/* Botones de Añadir visita, Exportar a Excel y Calendario */}
                    <Grid item xs={12} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir visita</Button>
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
                    {/* Lista de visitas */}
                    {filteredProyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
                        <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
                            <ProyectosCard
                                id={item.id}
                                imagen="https://cdn-icons-png.flaticon.com/512/753/753114.png"
                                fecha={item.fecha}
                                motivo={item.motivo}
                                nombre_vendedor={item.nombre_vendedor}
                                nombre_cliente={item.nombre_cliente}
                                actionDelete={() => deleteProyecto(item.id)}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
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

const ProyectosCard = ({ id, imagen, fecha, motivo, nombre_vendedor, nombre_cliente, actionDelete }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Visita" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{fecha}</Typography>
            <Typography variant="body2">{motivo}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {nombre_vendedor}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {nombre_cliente}</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
        </Box>
    );
};

export default Visitas;
