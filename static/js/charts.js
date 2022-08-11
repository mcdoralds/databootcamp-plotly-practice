function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}


// Create the buildCharts function.
function buildCharts(sample) {

  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var samplesArray = data.samples;
    // Create a variable that filters the samples for the object with the desired sample number.
    var selectedSamples = samplesArray.filter(data => data.id == sample);
    //  Create a variable that holds the first sample in the array.
    var firstSample = selectedSamples[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIds = firstSample.otu_ids; 
    var otuLabels = firstSample.otu_labels;
    var sampleValues = firstSample.sample_values;


    // ** BAR CHART **
    // Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 
    var yticks = otuIds.slice(0,10).map(id => "OTU " + id).reverse();

    // Create the trace for the bar chart. 
    var barData = [{
      x: sampleValues.slice(0,10).reverse(), // the x values are the sample_values in descending order
      text: otuLabels.slice(0,10).reverse(), // the hover text are the otu_labels in descending order
      type: "bar"
    }];

    // Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      yaxis: {
        tickmode: "array",
        tickvals: [0,1,2,3,4,5,6,7,8,9],
        ticktext: yticks
      },
      annotations: [{
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        xanchor: 'center',
        y: -0.25,
        yanchor: 'center',
        text: 'The bar chart displays the top 10 bacterial species (OTUs)<br>with the number of samples found in your belly button',
        showarrow: false
      }]
    };

    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout, {responsive: true});

    // ** BUBBLE CHART **
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otuIds,
      y: sampleValues,
      text: otuLabels,
      mode: 'markers',
      marker: {
        size: sampleValues,
        color: otuIds,
        colorscale: "Picnic"
      }
    }];
    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      showlegend: false,
      xaxis: {title: "OTU ID", automargin: true},
      yaxis: {automargin: true},
    };
    console.log(bubbleLayout);

    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout, {responsive: true});
    
    // ** GAUGE CHART **
    // Create a variable that filters the metadata array for the object with the desired sample number.
    var gaugeArray = data.metadata.filter(metaObj => metaObj.id == sample);  

    // Create a variable that holds the first sample in the metadata array.
    var gaugeResult = gaugeArray[0];
    // console.log(gaugeResult)
    // Create a variable that holds the washing frequency.
    var washFreq = gaugeResult.wfreq;
    // console.log(washFreq);

    // Create the trace for the gauge chart
    var gaugeData = [{
      value: washFreq,
      type: "indicator",
      mode: "gauge+number",
      title: {text: "<b> Washing Frequency </b> <br></br> Scrubs Per Week"},
      gauge: {
        axis: {range: [null,10], dtick: "2"},
        bar: {color: "black"},
        steps:[
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "lightgreen"},
          {range: [8, 10], color: "green"}
        ],
      }
    }];
    console.log(gaugeData);
    // Create the layout for the gauge chart.
    var gaugeLayout = { 
      autosize: true,
      annotations: [{
        xref: 'paper',
        yref: 'paper',
        x: 0.5,
        xanchor: 'center',
        y: 0,
        yanchor: 'center',
        text: "The gauge displays subject's <br> belly button weekly washing frequency",
        showarrow: false
      }]
    };
  // Use Plotly to plot the gauge data and layout.
  Plotly.newPlot("gauge", gaugeData, gaugeLayout, {responsive: true});
  });
};