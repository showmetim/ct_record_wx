import {
	createSSRApp
} from "vue";
import "./styles/common.scss";
import App from "./App.vue";
export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}
