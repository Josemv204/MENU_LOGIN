import React from 'react'
import { PersonOutlined, HomeOutlined, AssignmentIndOutlined, ContactPhoneSharp } from '@mui/icons-material'

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
		title: 'proyectos',
		path: '/app/proyectos',
		icon: <AssignmentIndOutlined />
	}
	
]

export default sidebarConfig