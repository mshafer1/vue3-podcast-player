<template>
    <div class="container border">
        <!-- <div class="row">
            <div class="col-sm-12 text-center">
                {{ trackTitle }}
            </div>
        </div>
        <div class="row align-items-center">
            <div class="col-sm-1">
                <button class="btn btn-dark p-4 rounded-circle btn-lg"><i class="fa fa-play"></i></button>
            </div>
            <div class="col-sm-11">
                <div class="progress">
                    <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        </div> -->
        <APlayer :audio="audio" ref="aplayer"/>
    </div>
</template>


<script setup>
    import { ref, onMounted } from "vue";
	import APlayer from "@worstone/vue-aplayer";
    
    const aplayer = ref(null);
    const audio = ref([]);

    onMounted(() => {
        let audios = [];
        aplayer.value.addList(audios);
    });
</script>