init();
//網頁載入預先執行
function init(){
    GetMaskData();
}

let map;
function GenerateMap (){
    //把地圖定位在#map
    map = L.map('map').locate({setView: true, maxZoom: 11, enableHighAccuracy: true });
    //載入圖磚
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //新增一個圖層(專門放icon群組)
    let markers = new L.MarkerClusterGroup().addTo(map);

    let iconColor;
    const greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
    });
    const yellowIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
});

    const orangeIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const greyIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    //針對口罩存量套用不同顏色的Icon
    for(let i=0; i<jsonData.length; i++){
        if(jsonData[i].properties.mask_adult <=200 || jsonData[i].properties.mask_child <=200){
            iconColor = redIcon;
        }
        else if(jsonData[i].properties.mask_adult <= 500 || jsonData[i].properties.mask_child<= 500){
            iconColor = orangeIcon;
        }
        else if(jsonData[i].properties.mask_adult <=1000 && jsonData[i].properties.mask_adult >=500 || jsonData[i].properties.mask_child<= 1000 && jsonData[i].properties.mask_child>= 500){
            iconColor = yellowIcon;
        }
        else if(jsonData[i].properties.mask_adult >1000 || jsonData[i].properties.mask_child > 1000){
            iconColor = greenIcon;
        }else {
            iconColor = greyIcon;
        }
            //在圖層上加上各個marker
            markers.addLayer(L.marker([jsonData[i].geometry.coordinates[1],jsonData[i].geometry.coordinates[0]],{icon: iconColor})
            .bindPopup(
                `<div class="markerMes">
                    <h2><i class="fas fadistance fa-clinic-medical"></i>${jsonData[i].properties.name}</h2>
                    <h3><i class="fas fadistance fa-map-marker-alt"></i>${jsonData[i].properties.address}</h3>
                    <h4><i class="fas fadistance fa-comment-dots"></i>${jsonData[i].properties.note}</h4>
                    <h3><i class="fas fadistance fa-phone"></i>電話:${jsonData[i].properties.phone}</h3>
                    <ul>
                        <li><h3>成人口罩:${jsonData[i].properties.mask_adult}</h3></li>
                        <li><h3>孩童口罩:${jsonData[i].properties.mask_child}</h3></li>
                    </ul>
                </div>`
                )
            .openPopup());
    }
    
    map.on('locationfound', OnLocationFound);
    map.on('locationerror', OnLocationError);
    // 成功監聽到使用者的位置時觸發
    function OnLocationFound(e) {
        console.log(e);
        //建立當前定位點的動畫與顏色
        let LocationIconAnimation = L.icon.pulse({iconSize:[20,20],color:'#009FCC',fillColor: 'rgb(7, 61, 161)'});
        //加上一個marker，設定使用者當前座標，並且把座標放在對應的地圖裡
        L.marker([e.latlng.lat, e.latlng.lng],{icon: LocationIconAnimation}).addTo(map)
        //針對這個marker，加上HTML內容
        .bindPopup(`<span class="location">You</span>`)
        .openPopup()
    }
    // 失敗時觸發
    function OnLocationError(e) {
        alert('地理位置請求失敗');
    }
}

//將資料變成全域變數，讓其他函式使用
let jsonData = {};

function GetMaskData() {
    let url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json';

    fetch(url, {method: 'get'})
        .then(response => {
           return response.json();
        })
        .then(data => {
             jsonData = data.features;
             filterList();
             GenerateMap();
        });
}


//過濾相同城市名稱
function filterList() {
    console.log(jsonData[0].geometry.coordinates[0]);
    let maskList = document.querySelector('.List ul');
    let searchBtn = document.getElementById('searchbtn');
    let searchValue = document.getElementById('searchList').value;
    const set = new Set();
    let str = '';
    //把地址前3個字(縣市名稱)重複的過濾掉
    let allList = jsonData.filter(item => {
        return !set.has(item.properties.address.substr(0,3))? set.add(item.properties.address.substr(0,3)):false;
    });
    //一開始顯示的資料(24個縣市各一筆)
    if(!searchValue){//這邊加入if判斷式式為了避免執行renderList函式，會被一開始渲染的資料給蓋掉
        allList.forEach(filterItem => {
            str += `<li>
                        <h2><i class="fas fadistance fa-clinic-medical"></i>${filterItem.properties.name}</h2>
                        <h3><i class="fas fadistance fa-map-marker-alt"></i>${filterItem.properties.address}</h3>
                        <h4><i class="fas fadistance fa-comment-dots"></i>${filterItem.properties.note}</h4>
                        <h3><i class="fas fadistance fa-phone"></i>${filterItem.properties.phone}</h3>
                        <button class="goBtn maskAdult" data-lat="${filterItem.geometry.coordinates[1]}" data-lng="${filterItem.geometry.coordinates[0]}"><i class="fas fadistance fa-male"></i>成人口罩:${filterItem.properties.mask_adult}個</button>
                        <button class="goBtn maskChild" data-lat="${filterItem.geometry.coordinates[1]}" data-lng="${filterItem.geometry.coordinates[0]}"><i class="fas fadistance fa-child"></i>孩童口罩:${filterItem.properties.mask_child}個</button>
                    </li>`;
        });
        maskList.innerHTML = str;
    }


    let go = document.querySelectorAll('.goBtn');
    searchBtn.addEventListener('click', renderList);
    //針對所有的button做監聽
    for(let i=0; i<go.length; i++){
        go[i].addEventListener('click', liFly);
    }
    

    //按下搜尋按鈕執行特定地區資料顯示
    function renderList() {
        let searchValue = document.getElementById('searchList').value;
        //把所輸入的 (台)轉成 (臺)
        searchValue = searchValue.replace('台','臺');
        let str2 = '';
        //針對輸入的值顯示對應的資料
        jsonData.forEach(partItem => {
            if(partItem.properties.address.substr(0,12).includes(searchValue) && searchValue !==''){
                str2 += `<li>
                            <h2><i class="fas fadistance fa-clinic-medical"></i>${partItem.properties.name}</h2>
                            <h3><i class="fas fadistance fa-map-marker-alt"></i>${partItem.properties.address}</h3>
                            <h4><i class="fas fadistance fa-comment-dots"></i>${partItem.properties.note}</h4>
                            <h3><i class="fas fadistance fa-phone"></i>${partItem.properties.phone}</h3>
                            <button class="goBtn maskAdult" data-lat="${partItem.geometry.coordinates[1]}" data-lng="${partItem.geometry.coordinates[0]}"><i class="fas fadistance fa-male"></i>成人口罩:${partItem.properties.mask_adult}個</button>
                            <button class="goBtn maskChild" data-lat="${partItem.geometry.coordinates[1]}" data-lng="${partItem.geometry.coordinates[0]}"><i class="fas fadistance fa-child"></i>孩童口罩:${partItem.properties.mask_child}個</button>
                        </li>`;
                map.flyTo([partItem.geometry.coordinates[1], partItem.geometry.coordinates[0]],13,{
                    animate: true,
                    duration: 2 // in seconds
                });
           }
        });
        maskList.innerHTML = str2;
        filterList();
    }
}

function liFly(e) {
    console.log(e.target.dataset.lat, e.target.dataset.lng);
    let liFlyLat = e.target.dataset.lat;
    let liFlyLng = e.target.dataset.lng;
    map.flyTo([liFlyLat, liFlyLng],16,{
        animate: true,
    });
}