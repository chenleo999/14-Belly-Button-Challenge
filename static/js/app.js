// data source url 
const url = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

// read in json, build dropdown
d3.json(url).then((data) => {
    let sel = d3.select("#selDataset");
    data.names.forEach((name) => {
        sel.append("option").text(name).property("value", name);
    });

    // on change call refresh function, pass in the new sample
    sel.on("change", function () {
        let new_spl = d3.select(this).property("value");
        optionChanged(new_spl);
    });

    // display the 1st sample to start
    let spl_1 = data.names[0];    
    dispMetadata(spl_1);
    dispBarBubble(spl_1);
    // dispGauge(spl_1);  
});

// metadata box function
function dispMetadata(sample) {
    d3.json(url).then(data => {
        let metadata = data.metadata;
        let results = metadata.filter(s => s.id == sample);
        let result = results[0];
        let meta_box = d3.select("#sample-metadata");

        // reset metadata box and populate new text
        meta_box.html("");
        Object.entries(result).forEach(([key, value]) => {
            meta_box.append("h6").text(`${key}: ${value}`);
        });
    });
}

// h-bar, bubble plot function
function dispBarBubble(sample) {
    d3.json(url).then(data => {
        let samples = data.samples;
        let results = samples.filter(s => s.id == sample);
        let result = results[0];

        let otu_ids = result.otu_ids;
        let otu_labels = result.otu_labels;
        let sample_values = result.sample_values;

        // data looks like already sorted in decending order, add this step just in case
        let top10 = getTopIndex(sample_values, 10);
        let top10_otu_ids = [];
        let top10_otu_labels = [];
        let top10_sample_values = [];

        for (let i = 0; i < 10; i++) {
            top10_otu_ids.push(otu_ids[top10[i]]);
            top10_otu_labels.push(otu_labels[top10[i]]);
            top10_sample_values.push(sample_values[top10[i]]);
        }

        // h-bar plot for top 10
        let y_ticks = top10_otu_ids.map(otuID => `OTU ${otuID}`).reverse();
        let bar_data = [{
            y: y_ticks,
            x: top10_sample_values.reverse(),
            text: top10_otu_labels.reverse(),
            type: "bar",
            orientation: "h"
        }];

        let bar_layout = {
            title: "Top 10 OTUs Found",
            margin: { t: 30, l: 150 }
        };

        Plotly.newPlot("bar", bar_data, bar_layout);

        // bubble plot
        let bubble_data = [{
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
                size: sample_values,
                color: otu_ids,
                colorscale: 'Picnic'
            }
        }];

        let bubble_layout = {
            title: 'OTUs Found In This Sample',
            showlegend: false,
            height: 600,
            width: 1200,
            xaxis: { title: 'OTU ID' },
            hovermode: 'closest'
        };

        Plotly.newPlot('bubble', bubble_data, bubble_layout);
    });
}

// refresh plot when new sample is selected
function optionChanged(new_spl) {
    console.log(`Check New Sample: ${new_spl}`);
    dispMetadata(new_spl);
    dispBarBubble(new_spl);
    // dispGauge(new_spl); 
}

// sort array in descending order, slice top N, return original index
function getTopIndex(arr, n) {
    let sorted_arr = arr.sort((a,b) => b-a);
    let top_sorted_arr = sorted_arr.slice(0, n);
    let top_idx = [];
    for (let i = 0; i < top_sorted_arr.length; i++) {
        for(let j = 0; j < arr.length; j++) {
            if (top_sorted_arr[i] == arr[j]) {
                top_idx.push(j);
            }
        }
    }
    return top_idx;
}
