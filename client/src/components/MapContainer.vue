<template>
	<div ref="map-root" style="width: 100%; height: 100%">
	</div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import 'ol/ol.css'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'
import { getCenter } from 'ol/extent'


export default {
	name: 'MapContainer',
	components: {},
	props: {
		boats: Object,
		headings: Array,
		activeRecording: Object,
		activeReplay: Object,
		replayHeading: Number,
		replayedBoat: Object,
	},
	data: () => ({
		olMap: null,
		vectorLayer: null,
	}),

	mounted() {

		this.vectorLayer = new VectorLayer({
			source: new VectorSource({
				features: []
			})
		})

		this.olMap = new Map({
			target: this.$refs['map-root'],
			layers: [
				new TileLayer({
					source: new OSM()
				}),
				this.vectorLayer
			],

			view: new View({
				zoom: 5,
				center: [0, 0],
				constrainResolution: true,
			}),
		})
		this.olMap.on('click', (e) => {
			this.olMap.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
				const recorded = feature.get('recorded')
				const line = feature.get('name')
				if (!recorded) {
					fetch(process.env.VUE_APP_SOCKET_ENDPOINT + '/start',
						{
							method: 'POST',
							mode: 'no-cors',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							body: `line=${line}`
						}
					).then(() => {
						this.$emit('changeline', line)
						feature.set('recorded', true)
					})

				} else {
					fetch(process.env.VUE_APP_SOCKET_ENDPOINT + '/stop', { mode: 'no-cors' })
						.then(() => {
							this.$emit('changeline', null)
							feature.set('recorded', false)
						})
				}
			})
		})

		this.olMap.getView().fit([2308427.160996733, 6142444.414658196, 2308768.012371982, 6143023.4081032])
		this.olMap.getView().setZoom(16)
		this.updateSource(this.boats)
	},

	watch: {
		boats(value) {
			this.updateSource(value)
		}

	},

	methods: {

		updateSource(boats) {

			const stroke = new Stroke({ color: 'black', width: 1 });
			const fill = new Fill({ color: 'green' });

			const liveBoatStyle = new Style({
				stroke: stroke,
				fill: fill
			})

			const recordedBoatStyle = new Style({
				stroke: stroke,
				fill: new Fill({ color: 'red' })
			})

			const replayedBoatStyle = new Style({
				stroke: stroke,
				fill: new Fill({ color: '#2c2c2c' })
			})

			const liveRecording = new Style({
				stroke: new Stroke({ color: 'red', width: 2 })
			})

			const replayedRecording = new Style({
				stroke: new Stroke({ color: '#2c2c2c', width: 2 })
			})

			const source = this.vectorLayer.getSource()


			source.clear();

			const features = new GeoJSON({
				featureProjection: 'EPSG:3857'
			}).readFeatures(boats)
			source.addFeatures(features);


			if (this.replayedBoat) {
				const boat = new GeoJSON({
					featureProjection: 'EPSG:3857'
				}).readFeature(this.replayedBoat)
				boat.setStyle(replayedBoatStyle)
				source.addFeature(boat)
				const anchor = getCenter(boat.getGeometry().getExtent())
				boat.getGeometry().rotate(this.replayHeading * (Math.PI / 180), anchor)

			}


			if (this.activeRecording) {
				const recording = new GeoJSON({
					featureProjection: 'EPSG:3857'
				}).readFeature(this.activeRecording)
				recording.setStyle(liveRecording)
				source.addFeature(recording);
			}

			if (this.activeReplay) {
				const replay = new GeoJSON({
					featureProjection: 'EPSG:3857'
				}).readFeature(this.activeReplay)
				replay.setStyle(replayedRecording)
				source.addFeature(replay)
			}


			for (let i = 0; i <= 2; i++) {
				const feature = features.at(i)
				feature.setStyle(!feature.get('recorded') ? liveBoatStyle : recordedBoatStyle)
				const anchor = getCenter(feature.getGeometry().getExtent())
				feature.getGeometry().rotate(this.headings.at(i) * (Math.PI / 180), anchor)
			}
		}
	}
}

</script>
