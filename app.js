(()=>{'use strict';
const $=id=>document.getElementById(id),categories=['All','Police','Medical','Fire','Government','Business','Transport','Recreation','Other'];let publicItems=[],adminItems=[],selected='All',query='',csrf=null,editing=null,markers=L.layerGroup();
const crs=L.extend({},L.CRS.Simple,{projection:L.Projection.LonLat,scale:z=>2**z,zoom:s=>Math.log2(s),transformation:new L.Transformation(.02072,117.3,-.0205,172.8),infinite:true});
const map=L.map('map',{crs,minZoom:2,maxZoom:6,zoomControl:false,preferCanvas:true});const bounds=L.latLngBounds(map.unproject([0,8192],5),map.unproject([8192,0],5));map.setMaxBounds(bounds.pad(.1));map.setView([0,0],3);L.control.zoom({position:'bottomright'}).addTo(map);markers.addTo(map);
const styles={atlas:'https://cdn.fivedock.dev/o/fivedock/maps/styleatlas/{z}/{x}/{y}.jpg',satellite:'https://cdn.fivedock.dev/o/fivedock/maps/stylesatellite/{z}/{x}/{y}.jpg'};
let layer;function tiles(style){if(layer)map.removeLayer(layer);layer=L.tileLayer(styles[style],{tileSize:256,minZoom:0,maxZoom:6,maxNativeZoom:5,bounds,attribution:'Map © Rockstar Games · Tiles via FiveDock',noWrap:true});layer.addTo(map)}tiles('atlas');
function toast(s){$('toast').textContent=s;$('toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').style.display='none',3200)}
const pos=a=>L.latLng(Number(a.y),Number(a.x));function focus(a){map.flyTo(pos(a),Math.max(5,map.getZoom()),{duration:.5})}
function copy(s){navigator.clipboard?.writeText(s).then(()=>toast('Copied to clipboard')).catch(()=>toast(s))}
function render(){const shown=publicItems.filter(a=>(selected==='All'||a.category===selected)&&(`${a.name} ${a.category} ${a.description} ${a.x} ${a.y}`).toLowerCase().includes(query));$('count').textContent=`${shown.length} location${shown.length===1?'':'s'} found`;$('locations').replaceChildren();markers.clearLayers();for(const a of shown){const b=document.createElement('button');b.className='location';const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=a.name;small.textContent=`${a.category} · X ${a.x.toFixed(1)} / Y ${a.y.toFixed(1)}`;b.append(strong,small);b.onclick=()=>focus(a);$('locations').append(b);const color=({Police:'#4c91e8',Medical:'#e65d5d',Fire:'#ec853e',Government:'#a986d6',Business:'#e2b75d',Transport:'#65c3c5',Recreation:'#70bd80'}[a.category]||'#a8b1bf');const m=L.circleMarker(pos(a),{radius:8,color:'#fff',weight:2,fillColor:color,fillOpacity:1});const pop=document.createElement('div');const title=document.createElement('strong');title.textContent=a.name;const p=document.createElement('p');p.textContent=a.description||a.category;const c=document.createElement('small');c.textContent=`X ${a.x} · Y ${a.y} · Z ${a.z}`;const btn=document.createElement('button');btn.textContent='Copy coordinates';btn.onclick=()=>copy(`${a.x}, ${a.y}, ${a.z}`);pop.append(title,p,c,document.createElement('br'),btn);m.bindPopup(pop).bindTooltip(a.name);m.addTo(markers)}}
function filters(){for(const cat of categories){const b=document.createElement('button');b.textContent=cat;b.className=cat===selected?'active':'';b.onclick=()=>{selected=cat;filtersRefresh();render()};$('filters').append(b)}}function filtersRefresh(){for(const b of $('filters').children)b.classList.toggle('active',b.textContent===selected)}filters();

fetch('./locations.json').then(r=>{if(!r.ok)throw Error('Locations unavailable');return r.json()}).then(data=>{publicItems=data.filter(x=>x.public!==false);render()}).catch(e=>toast(e.message));
})();
$('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render()});
$('style').addEventListener('change',e=>tiles(e.target.value));
$('reset').addEventListener('click',()=>map.setView([0,0],3));
$('copylink').addEventListener('click',()=>copy(location.href));
map.on('mousemove',e=>{$('coords').textContent=`X ${e.latlng.lng.toFixed(1)} / Y ${e.latlng.lat.toFixed(1)}`});
})();
