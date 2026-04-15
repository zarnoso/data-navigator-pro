export interface Region {
  name: string;
  comunas: string[];
}

export const regionsChile: Region[] = [
  { name: "Arica y Parinacota", comunas: ["Arica", "Camarones", "General Lagos", "Putre"] },
  { name: "Tarapacá", comunas: ["Alto Hospicio", "Camiña", "Colchane", "Huara", "Iquique", "Pica", "Pozo Almonte"] },
  { name: "Antofagasta", comunas: ["Antofagasta", "Calama", "María Elena", "Mejillones", "Ollagüe", "San Pedro de Atacama", "Sierra Gorda", "Taltal", "Tocopilla"] },
  { name: "Atacama", comunas: ["Alto del Carmen", "Caldera", "Chañaral", "Copiapó", "Diego de Almagro", "Freirina", "Huasco", "Tierra Amarilla", "Vallenar"] },
  { name: "Coquimbo", comunas: ["Andacollo", "Canela", "Combarbalá", "Coquimbo", "Illapel", "La Higuera", "La Serena", "Los Vilos", "Monte Patria", "Ovalle", "Paihuano", "Punitaqui", "Río Hurtado", "Salamanca", "Vicuña"] },
  { name: "Valparaíso", comunas: ["Algarrobo", "Cabildo", "Calle Larga", "Cartagena", "Casablanca", "Catemu", "Concón", "El Quisco", "El Tabo", "Hijuelas", "Isla de Pascua", "Juan Fernández", "La Cruz", "La Ligua", "Limache", "Llaillay", "Los Andes", "Nogales", "Olmué", "Panquehue", "Papudo", "Petorca", "Puchuncaví", "Putaendo", "Quillota", "Quilpué", "Quintero", "Rinconada", "San Antonio", "San Esteban", "San Felipe", "Santa María", "Santo Domingo", "Valparaíso", "Villa Alemana", "Viña del Mar", "Zapallar"] },
  { name: "Metropolitana", comunas: ["Alhué", "Buin", "Calera de Tango", "Cerrillos", "Cerro Navia", "Colina", "Conchalí", "Curacaví", "El Bosque", "El Monte", "Estación Central", "Huechuraba", "Independencia", "Isla de Maipo", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Lampa", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "María Pinto", "Melipilla", "Ñuñoa", "Padre Hurtado", "Paine", "Pedro Aguirre Cerda", "Peñaflor", "Peñalolén", "Pirque", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San José de Maipo", "San Miguel", "San Pedro", "San Ramón", "Santiago", "Talagante", "Tiltil", "Vitacura"] },
  { name: "O'Higgins", comunas: ["Chimbarongo", "Chépica", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "La Estrella", "Las Cabras", "Litueche", "Lolol", "Machalí", "Malloa", "Marchigüe", "Mostazal", "Nancagua", "Navidad", "Olivar", "Palmilla", "Paredones", "Peralillo", "Peumo", "Pichidegua", "Pichilemu", "Placilla", "Pumanque", "Quinta de Tilcoco", "Rancagua", "Rengo", "Requínoa", "San Fernando", "San Vicente", "Santa Cruz"] },
  { name: "Maule", comunas: ["Cauquenes", "Chanco", "Colbún", "Constitución", "Curepto", "Curicó", "Empedrado", "Hualañé", "Licantén", "Linares", "Longaví", "Maule", "Molina", "Parral", "Pelarco", "Pelluhue", "Pencahue", "Rauco", "Retiro", "Río Claro", "Romeral", "Sagrada Familia", "San Clemente", "San Javier", "San Rafael", "Talca", "Teno", "Vichuquén", "Villa Alegre", "Yerbas Buenas"] },
  { name: "Ñuble", comunas: ["Bulnes", "Chillán", "Chillán Viejo", "Cobquecura", "Coelemu", "Coihueco", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"] },
  { name: "Biobío", comunas: ["Alto Biobío", "Antuco", "Arauco", "Cabrero", "Cañete", "Chiguayante", "Concepción", "Contulmo", "Coronel", "Curanilahue", "Florida", "Hualpén", "Hualqui", "Laja", "Lebu", "Los Álamos", "Los Ángeles", "Lota", "Mulchén", "Nacimiento", "Negrete", "Penco", "Quilaco", "Quilleco", "San Pedro de la Paz", "San Rosendo", "Santa Bárbara", "Santa Juana", "Talcahuano", "Tirúa", "Tomé", "Tucapel", "Yumbel"] },
  { name: "Araucanía", comunas: ["Angol", "Carahue", "Cholchol", "Collipulli", "Cunco", "Curacautín", "Curarrehue", "Ercilla", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Lonquimay", "Los Sauces", "Lumaco", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Purén", "Renaico", "Saavedra", "Temuco", "Teodoro Schmidt", "Toltén", "Traiguén", "Victoria", "Vilcún", "Villarrica"] },
  { name: "Los Ríos", comunas: ["Corral", "Futrono", "La Unión", "Lago Ranco", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "Río Bueno", "Valdivia"] },
  { name: "Los Lagos", comunas: ["Ancud", "Calbuco", "Castro", "Chaitén", "Chonchi", "Cochamó", "Curaco de Vélez", "Dalcahue", "Fresia", "Frutillar", "Futaleufú", "Hualaihué", "Llanquihue", "Los Muermos", "Maullín", "Osorno", "Palena", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Puqueldón", "Purranque", "Puyehue", "Queilén", "Quellón", "Quemchi", "Quinchao", "Río Negro", "San Juan de la Costa", "San Pablo"] },
  { name: "Aysén", comunas: ["Aysén", "Chile Chico", "Cisnes", "Cochrane", "Coyhaique", "Guaitecas", "Lago Verde", "O'Higgins", "Río Ibáñez", "Tortel"] },
  { name: "Magallanes", comunas: ["Antártica", "Cabo de Hornos", "Laguna Blanca", "Natales", "Porvenir", "Primavera", "Punta Arenas", "Río Verde", "San Gregorio", "Timaukel", "Torres del Paine"] },
];

export interface Country {
  name: string;
  flag: string;
  regions: Region[];
}

export const latinAmericaCountries: Country[] = [
  { name: "Argentina", flag: "🇦🇷", regions: [
    { name: "Buenos Aires", comunas: ["CABA", "La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Lanús", "Avellaneda", "Morón", "Lomas de Zamora"] },
    { name: "Córdoba", comunas: ["Córdoba Capital", "Villa María", "Río Cuarto", "San Francisco", "Carlos Paz"] },
    { name: "Santa Fe", comunas: ["Rosario", "Santa Fe Capital", "Rafaela", "Venado Tuerto"] },
    { name: "Mendoza", comunas: ["Mendoza Capital", "San Rafael", "Godoy Cruz", "Guaymallén"] },
    { name: "Tucumán", comunas: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo"] },
  ]},
  { name: "Perú", flag: "🇵🇪", regions: [
    { name: "Lima", comunas: ["Lima Cercado", "Miraflores", "San Isidro", "Surco", "San Borja", "La Molina", "Barranco"] },
    { name: "Arequipa", comunas: ["Arequipa", "Cayma", "Cerro Colorado", "Yanahuara"] },
    { name: "La Libertad", comunas: ["Trujillo", "Huanchaco", "Laredo", "Moche"] },
    { name: "Cusco", comunas: ["Cusco", "San Jerónimo", "Santiago", "Wanchaq"] },
  ]},
  { name: "Colombia", flag: "🇨🇴", regions: [
    { name: "Bogotá D.C.", comunas: ["Usaquén", "Chapinero", "Santa Fe", "Teusaquillo", "Suba", "Kennedy"] },
    { name: "Antioquia", comunas: ["Medellín", "Envigado", "Itagüí", "Bello", "Sabaneta"] },
    { name: "Valle del Cauca", comunas: ["Cali", "Palmira", "Buenaventura", "Tuluá"] },
    { name: "Atlántico", comunas: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"] },
  ]},
  { name: "México", flag: "🇲🇽", regions: [
    { name: "CDMX", comunas: ["Cuauhtémoc", "Miguel Hidalgo", "Benito Juárez", "Coyoacán", "Álvaro Obregón", "Tlalpan"] },
    { name: "Jalisco", comunas: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"] },
    { name: "Nuevo León", comunas: ["Monterrey", "San Pedro Garza García", "San Nicolás", "Apodaca"] },
    { name: "Estado de México", comunas: ["Naucalpan", "Tlalnepantla", "Ecatepec", "Huixquilucan"] },
  ]},
  { name: "Brasil", flag: "🇧🇷", regions: [
    { name: "São Paulo", comunas: ["São Paulo Capital", "Campinas", "Santos", "Guarulhos"] },
    { name: "Rio de Janeiro", comunas: ["Rio de Janeiro Capital", "Niterói", "Petrópolis"] },
    { name: "Minas Gerais", comunas: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"] },
  ]},
  { name: "Ecuador", flag: "🇪🇨", regions: [
    { name: "Pichincha", comunas: ["Quito", "Rumiñahui", "Mejía"] },
    { name: "Guayas", comunas: ["Guayaquil", "Samborondón", "Durán"] },
    { name: "Azuay", comunas: ["Cuenca", "Gualaceo"] },
  ]},
  { name: "Bolivia", flag: "🇧🇴", regions: [
    { name: "La Paz", comunas: ["La Paz", "El Alto", "Viacha"] },
    { name: "Santa Cruz", comunas: ["Santa Cruz de la Sierra", "Montero", "Warnes"] },
    { name: "Cochabamba", comunas: ["Cochabamba", "Quillacollo", "Sacaba"] },
  ]},
  { name: "Paraguay", flag: "🇵🇾", regions: [
    { name: "Central", comunas: ["Asunción", "San Lorenzo", "Luque", "Fernando de la Mora"] },
    { name: "Alto Paraná", comunas: ["Ciudad del Este", "Hernandarias", "Presidente Franco"] },
  ]},
  { name: "Uruguay", flag: "🇺🇾", regions: [
    { name: "Montevideo", comunas: ["Centro", "Pocitos", "Carrasco", "Punta Carretas"] },
    { name: "Canelones", comunas: ["Las Piedras", "Ciudad de la Costa", "Pando"] },
  ]},
  { name: "Panamá", flag: "🇵🇦", regions: [
    { name: "Panamá", comunas: ["Ciudad de Panamá", "San Miguelito", "Arraiján"] },
  ]},
  { name: "Costa Rica", flag: "🇨🇷", regions: [
    { name: "San José", comunas: ["San José Centro", "Escazú", "Santa Ana", "Curridabat"] },
  ]},
];

export const industries = [
  "Construcción y Ferreterías",
  "Clínicas y Centros Médicos",
  "Retail y Minimarkets",
  "Restaurantes y Cafeterías",
  "Empresas IT y Software",
  "Inmobiliarias",
  "Distribuidoras",
  "Transporte y Logística",
  "Educación y Capacitación",
  "Servicios Financieros",
  "Agricultura y Agroindustria",
  "Minería",
  "Turismo y Hotelería",
  "Automotriz",
  "Energía y Medio Ambiente",
];

export const getMonthName = (): string => {
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return months[new Date().getMonth()];
};
