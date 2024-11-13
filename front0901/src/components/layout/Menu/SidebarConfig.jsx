import React from 'react'
import { PersonOutlined, HomeOutlined, AssignmentIndOutlined, ContactPhoneSharp, AddLocationAlt, MonetizationOn, Receipt } from '@mui/icons-material'

const sidebarConfig = [
	{
		title: 'inicio',
		path: '/app',
		icon: <HomeOutlined />
	},
	{
		title: 'vendedores',
		path: '/app/usuarios',
		icon: <PersonOutlined />
	},
	{
		title: 'clientes',
		path: '/app/clientes',
		icon: <ContactPhoneSharp />
	},
	{
		title: 'Visitas',
		path: '/app/proyectos',
		icon: <AddLocationAlt />
	},
	{
		title: 'Ventas',
		path: '/app/proyectos',
		icon: <MonetizationOn />
	},
	{
		title: 'Presupuestos',
		path: '/app/proyectos',
		icon: <Receipt />
	}
	
]

export default sidebarConfig