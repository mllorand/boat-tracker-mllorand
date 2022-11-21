<template>
	<div id="app">
		<div id="map">
			<MapContainer :boats="boats" :headings="headings" :replayHeading="replayHeading"
				:activeRecording="activeRecording" :activeReplay="activeReplay" :replayedBoat="replayedBoat"
				v-on:changeline="recordedLine = $event">
			</MapContainer>
		</div>
		<div id="records">
			<h2>Recorded tracks:</h2>
			<button @click="stopReplay">Stop Replay</button>
			<ul>
				<li v-for="record in recordings" @click="startReplay(record.recording_id)">
					<p>{{ record.start_time }}: {{ record.line }}</p>
				</li>
			</ul>
		</div>
	</div>
</template>


<script>
import SocketioService from './services/socketio.service.js';
import MapContainer from './components/MapContainer.vue';
export default {
	name: 'App',
	components: {
		MapContainer
	},

	data: () => ({


		recordings: null,

		headings: [3.470315226, 162.6569972, 87.18099145],

		recordedLine: null,

		activeRecording: null,

		activeReplay: null,

		replayedBoat: null,

		socket: null,

		replayHeading: null,

		boats: {
			type: 'FeatureCollection',
			crs: {
				type: 'name',
				properties: {
					name: 'EPSG:3857',
				},
			},
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: [20.73998593, 48.21339894]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: [20.73990023, 48.21496414]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: [20.73651803, 48.21694363]
					}
				}
			]
		}

	}),

	mounted() {

		const x = 0.00006
		const y = 0.00016

		fetch(process.env.VUE_APP_SOCKET_ENDPOINT + '/recordings')
			.then(res => res.json())
			.then(data => this.recordings = data)

		this.socket = SocketioService.setupSocketConnection()

		this.socket.on('start', line => {
			this.recordedLine = line
		})

		this.socket.on('stop', () => {
			this.recordedLine = null
		})

		this.socket.on('replay', () => {
			this.activeReplay = {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: []
				}
			}
		})

		this.socket.on('stopreplay', () => {
			this.activeReplay = null
			this.replayedBoat = null
		})

		this.socket.on('positions', data => {

			const positions = JSON.parse(data)

			if (this.activeRecording) {
				const newActiveRecording = {
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: this.activeRecording.geometry.coordinates
					}
				}
				newActiveRecording.geometry.coordinates.push([positions[this.recordedLine].lon - x * y, positions[this.recordedLine].lat - y / 1.2])
				this.activeRecording = newActiveRecording
			}

			if (this.activeReplay) {
				const newActiveReplay = {
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: this.activeReplay.geometry.coordinates
					}
				}

				let replayed = positions.replay

				const newReplayedBoat = {
					type: 'Feature',
					properties: { name: 'replayed' },
					geometry: {
						type: 'Polygon',
						coordinates: [[
							[+replayed.lon - x * y, +replayed.lat - y / 1.2],
							[+replayed.lon + x, +replayed.lat - y],
							[+replayed.lon, +replayed.lat],
							[+replayed.lon - x, +replayed.lat - y],
							[+replayed.lon - x * y, +replayed.lat - y / 1.2],
						]]
					}
				}

				newActiveReplay.geometry.coordinates.push([replayed.lon - x * y, replayed.lat - y / 1.2])
				this.replayHeading = +replayed.heading
				this.activeReplay = newActiveReplay
				this.replayedBoat = newReplayedBoat
			}



			const newBoats = {
				type: 'FeatureCollection',
				crs: {
					type: 'name',
					properties: {
						name: 'EPSG:3857',
					},
				},
				features: [
					{
						type: 'Feature',
						properties: { name: 'line1', recorded: this.recordedLine == 'line1' },
						geometry: {
							type: 'Polygon',
							coordinates: [[
								[positions.line1.lon - x * y, positions.line1.lat - y / 1.2],
								[positions.line1.lon + x, positions.line1.lat - y],
								[positions.line1.lon, positions.line1.lat],
								[positions.line1.lon - x, positions.line1.lat - y],
								[positions.line1.lon - x * y, positions.line1.lat - y / 1.2],
							]],
						},
						layout: 'YX'
					},
					{
						type: 'Feature',
						properties: { name: 'line2', recorded: this.recordedLine == 'line2' },
						geometry: {
							type: 'Polygon',
							coordinates: [[
								[positions.line2.lon - x * y, positions.line2.lat - y / 1.2],
								[positions.line2.lon + x, positions.line2.lat - y],
								[positions.line2.lon, positions.line2.lat],
								[positions.line2.lon - x, positions.line2.lat - y],
								[positions.line2.lon - x * y, positions.line2.lat - y / 1.2],
							]],
						},
						layout: 'YX'
					},

					{
						type: 'Feature',
						properties: { name: 'line3', recorded: this.recordedLine == 'line3' },
						geometry: {
							type: 'Polygon',
							coordinates:
								[[
									[positions.line3.lon - x * y, positions.line3.lat - y / 1.2],
									[positions.line3.lon + x, positions.line3.lat - y],
									[positions.line3.lon, positions.line3.lat],
									[positions.line3.lon - x, positions.line3.lat - y],
									[positions.line3.lon - x * y, positions.line3.lat - y / 1.2],
								]],
						},
						layout: 'YX'
					}
				]
			}
			this.headings = [positions.line1.heading, positions.line2.heading, positions.line3.heading]
			this.boats = newBoats

		});
	},

	watch: {
		recordedLine(value) {
			if (value) {
				this.activeRecording = {
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: []
					}
				}
			} else {
				this.activeRecording = null
				fetch(process.env.VUE_APP_SOCKET_ENDPOINT + '/recordings')
					.then(res => res.json())
					.then(data => this.recordings = data)
			}
		},
	},

	beforeUnmount() {
		SocketioService.disconnect()
	},

	methods: {
		startReplay(recordingId) {
			fetch(process.env.VUE_APP_SOCKET_ENDPOINT + `/saved?recordingId=${recordingId}`)
		},
		stopReplay() {
			this.socket.emit('stopreplay')
		}
	}
}
</script>

<style>
html,
body {
	height: 100%;
	margin: 0;
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	height: 100%;
	display: grid;
	grid-template-columns: 9fr 2fr;
	grid-auto-rows: 1fr;
	grid-gap: 1rem;
	padding: 1rem;
	box-sizing: border-box;
}

#map {
	grid-column: 1;
	grid-row-start: 1;
	grid-row-end: 1;
}

#records {
	grid-column: 2;
}

li {
	background: #fff;
	margin: 20px auto;
	padding: 10px 20px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

li:hover {
	color: green;
	cursor: pointer;
	font-weight: bolder;
}
</style>
