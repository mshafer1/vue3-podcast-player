<template>
    <div class="app-height">
        <div class="row fixed-top">
            <div class="col-md-1 d-none d-md-block">&nbsp;</div>
            <div class="col-md-10 col-sm-12">
                <APlayer :audio="audio" ref="aplayer" loop="false" />
            </div>
            <div class="col-md-1 d-none d-md-block">&nbsp;</div>
        </div>
        <div style="min-height: 100px;">

        </div>
        <div class="container">
            <div class="row">
                <div class="col-sm-12 text-center">{{ episodes.length }} episodes available</div>
            </div>
            <div class="container border">
                <template v-for="episode in episodes" :key="episode.name">
                    <div class="row pb-1 mt-5">
                        <div class="col-sm-1">
                            <img :src="episode.cover" class="img-fluid" />
                        </div>
                        <div class="col-sm-4">
                            <b>{{ episode.name }}</b> <br />
                            {{ episode.pubDate }}
                        </div>
                        <div class="col-sm-3">
                            {{ episode.length }}
                        </div>
                        <div class="col-sm-2">
                            <button class="btn btn-dark p-4 rounded-circle btn-md" :disabled="episode.is_playing"
                                @click="play(episode)"><i class="bi" :class="episode.icon"></i></button>
                        </div>
                        <div class="col-sm-2" v-html="episode.infoButton()"></div>
                    </div>
                    <div class="pb-3 border-bottom" v-html="episode.summaryCollapsable()"></div>
                </template>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import APlayer from "@worstone/vue-aplayer";
import axios from "axios";
import xml2js from "xml2js";

class Episode {
    constructor(name, length, link, image, summary, pubDate, guid, author) {
        this.name = name;
        this.length = length;
        this.url = link;
        this.icon = "bi-play-fill";
        this.summary = summary;
        this.cover = image;
        this.pubDate = pubDate;
        this.guid = guid;
        this.author=author;
        
        this.theme = '#41b883'
        this.is_playing = false;
        // this.is_paused=false;
    }

    infoButton() {
        return `<button type="button" class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#descriptionCollapse-${this.guid}"
                aria-expanded="false" aria-controls='descriptionCollapse-${this.guid}'>&gt;</button>`
    }

    summaryCollapsable() {
        return `<div class="collapse multi-collapse" id="descriptionCollapse-${this.guid}">
                    <div>
                        ${this.summary}
                    </div>
                </div>`
    }
}

const parsedData = ref(null);
const aplayer = ref(null);
const audio = ref([]);
const loaded = ref(false);
const episodes = ref([]);

function loadEpisodes(rss) {
    // console.log(rss.data)
    xml2js.parseString(rss.data, (err, result) => {
        parsedData.value = result;
        // console.log("value", parsedData.value);
        // console.log("feed", result.rss.feed)
        result.rss.channel[0].item.forEach((value) => {
            console.log("item: ", value)
            var ep = new Episode(
                value.title[0],
                value['itunes:duration'][0],
                value.enclosure[0]['$'].url,
                value['itunes:image'][0]['$'].href,
                value['itunes:summary'][0].replace("<p>", "").replace("</p>", ""),
                value['pubDate'][0],
                value.guid[0]["_"],
                value['dc:creator'][0],
            );
            episodes.value.push(ep);
        })
        loaded.value = true;
    });
}

function play(episode) {
    console.log("Loading", episode.name)

    episodes.value.forEach((ep) => { ep.is_playing = false })

    episode.is_playing = true;
    aplayer.value.pause()
    aplayer.value.clearList();

    audio.value = [episode]
    aplayer.value.play()
}

onMounted(() => {
    let audios = [];
    aplayer.value.addList(audios);

    axios.get("https://anchor.fm/s/d5a0c50/podcast/rss", { "count": 5 }).catch((response) => { console.log("Error", response) })
        .catch((response) => { console.log("failure", response) })
        .then((response) => {
            if (typeof (response) !== "undefined") {
                console.log("success", response)
                loadEpisodes(response)
            }
        })
    // loadEpisodes();
});
</script>

<style lang="css">
button.btn[aria-expanded="true"] {
    /* transform: rotate(90deg); */
    writing-mode: vertical-rl;
}

.app-height {
    max-height: 500px;
    overflow-y: scroll;
}
</style>