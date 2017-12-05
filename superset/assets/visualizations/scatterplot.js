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

/* eslint-disable camelcase */
function formatLabel(column, verbose_map) {
    let label;
    if (Array.isArray(column) && column.length) {
        label = verbose_map[column[0]] || column[0];
        if (column.length > 1) {
            label += ', ';
        }
        label += column.slice(1).join(', ');
    } else {
        label = verbose_map[column] || column;
    }
    return label;
}
/* eslint-enable camelcase */

/**
 * NVD3 scatter plot data format
 *  [{
 *     key    : 'group1'
 *     values : [{x,y,size,shape(opt)}...{..}]
 *  },
 *  ...
 *  {key,values}]
 */


function scatterplot(slice, payload) {
    let chart;

    let data;
    if (payload.data) {
        data = payload.data.map(x => ({
            ...x, key: formatLabel(x.key, slice.datasource.verbose_map)
    }));
    } else {
        data = [];
    }

    slice.container.html('');
    slice.clearError();


    let width  = slice.width()
    let height = slice.height()
    const fd   = slice.formData;

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
        const f = d3.format('.3s');
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

        chart.height(slice.height())
        chart.width(slice.width())
        // on scroll, hide tooltips. throttle to only 4x/second.
        $(window).scroll(throttle(hideTooltips, 250));


        const xAxisFormatter = d3FormatPreset(fd.x_axis_format)
        if (chart.xAxis && chart.xAxis.tickFormat) {
            chart.xAxis.tickFormat(xAxisFormatter)
        }

        const yAxisFormatter = d3FormatPreset(fd.y_axis_format)
        if (chart.yAxis && chart.yAxis.tickFormat) {
            chart.yAxis.tickFormat(yAxisFormatter)
        }

        svg.datum(data)
           .transition().duration(500)
           .attr('height', height)
           .attr('width', width)
           .call(chart);

        return chart;
    }

    // hide tooltips before rendering chart, if the chart is being re-rendered sometimes
    // there are left over tooltips in the dom,
    // this will clear them before rendering the chart again.
    hideTooltips();

    nv.addGraph(drawGraph);
}

module.exports = scatterplot;
