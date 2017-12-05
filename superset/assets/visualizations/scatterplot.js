import $        from 'jquery'
import throttle from 'lodash.throttle'
import d3       from 'd3'
import nv       from 'nvd3'
import d3tip    from 'd3-tip'

import { getColorFromScheme } from '../javascripts/modules/colors';
import { customizeToolTip, d3TimeFormatPreset, d3FormatPreset, tryNumify } from '../javascripts/modules/utils';


import '../node_modules/nvd3/build/nv.d3.min.css';
import './scatterplot.css';


const BREAKPOINTS = {
    small: 340,
};


function hideTooltips() {
    $('.nvtooltip').css({ opacity: 0 });
}


function scatterplot(slice, payload) {
    let chart;

    let data;
    if (payload.data) {
        data = payload.data.map(x => ({
            ...x,
    }));
    } else {
        data = [];
    }

    slice.container.html('');
    slice.clearError();


    let width = slice.width();
    const fd = slice.formData;

    let row;

    const drawGraph = function () {
        let svg = d3.select(slice.selector).select('svg');
        if (svg.empty()) {
            svg = d3.select(slice.selector).append('svg');
        }
        row = (col1, col2) => `<tr><td>${col1}</td><td>${col2}</td></tr>`;
        chart = nv.models.scatterChart();
        chart.showDistX(true);
        chart.showDistY(true);
        chart.tooltip.contentGenerator(function (obj) {
            const p = obj.point;
            let s = '<table>';
            s += (
                `<tr><td style="color: ${p.color};">` +
                `<strong>${p[fd.entity]}</strong> (${p.group})` +
                '</td></tr>');
            s += row(fd.x, f(p.x));
            s += row(fd.y, f(p.y));
            s += row(fd.size, f(p.size));
            s += '</table>';
            return s;
        });
        chart.pointRange([5, fd.max_bubble_size ** 2]);
        chart.pointDomain([0, d3.max(data, d => d3.max(d.values, v => v.size))]);


        if ('showLegend' in chart && typeof fd.show_legend !== 'undefined') {
            if (width < BREAKPOINTS.small) {
                chart.showLegend(false);
            } else {
                chart.showLegend(fd.show_legend);
            }
        }


        // on scroll, hide tooltips. throttle to only 4x/second.
        $(window).scroll(throttle(hideTooltips, 250));

        return chart;
    };

    // hide tooltips before rendering chart, if the chart is being re-rendered sometimes
    // there are left over tooltips in the dom,
    // this will clear them before rendering the chart again.
    hideTooltips();

    nv.addGraph(drawGraph);
}

module.exports = scatterplot;
