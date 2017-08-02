import Component from 'can-component';
import DefineMap from 'can-define/map/map';
import template from './lmap.stache';
import './lmap.less';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BasemapLayer from 'esri-leaflet/src/Layers/BasemapLayer';
import FeatureLayer from 'esri-leaflet/src/Layers/FeatureLayer/FeatureLayer';
import canViewModel from 'can-view-model';

export const ViewModel = DefineMap.extend('LMap', {seal: false}, {
    mapObject: '*',
    layers: {
        value () {
            return [
                new BasemapLayer('Topographic')
            ];
        }
    },
    x: {
        value: 37.75
    },
    y: {
        value: -122.23
    },
    zoom: {
        value: 10
    },
    createMap (element) {
        if (this.mapObject) {
            return;
        }
        this.mapObject = L.map(element).setView([this.x, this.y], this.zoom);
        this.layers.forEach((l) => {
            this.mapObject.addLayer(l);
        });
    },
    destroyMap () {
        if (this.mapObject) {
            this.mapObject.remove();
            this.mapObject = null;
        }
    }
});

export const LMap = Component.extend({
    tag: 'l-map',
    ViewModel: ViewModel,
    view: template,
    events: {
        inserted (element) {
            this.viewModel.createMap(element.querySelector('.l-map-container'));
        },
        beforeremove () {
            this.viewModel.destroyMap();
        }
    }
});
export default LMap;

export const LFeatureLayer = Component.extend({
    tag: 'l-feature-layer',
    ViewModel: DefineMap.extend({
        url: 'string',
        _layer: '*',
        _map: {
            set (map) {
                this._layer = new FeatureLayer({url: this.url});
                this._layer.addTo(map);
                console.log(map);
                return map;
            }
        },
        destroy () {
            console.log('Dstroying!!');
            this._map.removeLayer(this._layer);
            this._layer = null;
            this._map = null;
        }
    }),
    events: {
        inserted (element) {
            debugger;
            const lmap = canViewModel(element.parentElement);
            if (lmap && lmap.mapObject) {
                this.viewModel._map = lmap.mapObject;
            }
        }
    }
});
