export const allServiciosList = [
  "DESAYUNO", "COMIDA", "CENA", "BIBERÓN", "PAPILLA", "FÚTBOL", "TAE KWON DO", "BE AN ARTIST",
  "JAZZ", "BALLET", "DANZA ÁRABE", "ENSAMBLE MUSICAL", "TENNIS", "BASQUETBOL", "TOCHO BANDERA",
  "TECLADO", "TEATRO MUSICAL", "AJEDREZ", "VOLEIBOL", "GIMNASIA", "TE 0.5H", "TE 1H", "TE 1.5H",
  "TE 2H", "TE 2.5H", "TE 3H", "TE 3.5H", "TE 4H", "CLUB DE TAREAS", "DISEÑO GRÁFICO", "HUSKY BAND",
  "ROBÓTICA", "AJEDREZ (4 DÍAS)", "BE AN ARTIST (4 DÍAS)", "JAZZ REPRESENTATIVO (4 DÍAS)",
  "TRANSPORTE REDONDO R1", "TRANSPORTE REDONDO R2", "TRANSPORTE SENCILLO R1", "TRANSPORTE SENCILLO R2", "TRANSPORTE SENCILLO R3", "INGLÉS", "FRANCÉS", "CATECISMO"
];

export const getPlantelTheme = (plantel) => {
  const themes = {
    'PM': { color: '#2563eb', icon: 'fa-school', name: 'Primaria Metepec', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
    'PT': { color: '#0284c7', icon: 'fa-school', name: 'Primaria Toluca', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' },
    'SM': { color: '#059669', icon: 'fa-university', name: 'Secundaria Metepec', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
    'ST': { color: '#10b981', icon: 'fa-university', name: 'Secundaria Toluca', gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
    'PREEM': { color: '#d97706', icon: 'fa-building', name: 'Preescolar Metepec', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
    'PREET': { color: '#ea580c', icon: 'fa-building', name: 'Preescolar Toluca', gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
    'CM': { color: '#dc2626', icon: 'fa-house-user', name: 'Casita Metepec', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
    'CT': { color: '#e11d48', icon: 'fa-house-user', name: 'Casita Toluca', gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' },
    'DM': { color: '#7c3aed', icon: 'fa-flask', name: 'Desarrollo Metepec', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    'ISM': { color: '#4f46e5', icon: 'fa-graduation-cap', name: 'Inst. Sec. Metepec', gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  }
  return themes[plantel] || { color: '#475569', icon: 'fa-landmark', name: plantel || 'Plantel', gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)' }
}

export const getServiceIcon = (servicio) => {
  if (!servicio) return 'fa-star';
  const s = servicio.toLowerCase();
  if (s.includes('fútbol')) return 'fa-futbol';
  if (s.includes('basquetbol')) return 'fa-basketball-ball';
  if (s.includes('voleibol')) return 'fa-volleyball-ball';
  if (s.includes('tae kwon do')) return 'fa-user-ninja';
  if (s.includes('ballet') || s.includes('jazz') || s.includes('danza')) return 'fa-shoe-prints';
  if (s.includes('teclado') || s.includes('música') || s.includes('band') || s.includes('ensamble')) return 'fa-music';
  if (s.includes('tennis')) return 'fa-table-tennis';
  if (s.includes('ajedrez')) return 'fa-chess';
  if (s.includes('desayuno') || s.includes('comida') || s.includes('cena')) return 'fa-utensils';
  if (s.includes('biberón') || s.includes('papilla')) return 'fa-baby';
  if (s.includes('transporte')) return 'fa-bus';
  if (s.includes('inglés') || s.includes('francés')) return 'fa-language';
  if (s.includes('teatro') || s.includes('artist') || s.includes('diseño')) return 'fa-palette';
  if (s.includes('robótica')) return 'fa-robot';
  if (s.includes('tareas') || s.includes('catecismo')) return 'fa-book-open';
  if (s.includes('te ')) return 'fa-clock'; // Tiempo extendido
  return 'fa-star';
}