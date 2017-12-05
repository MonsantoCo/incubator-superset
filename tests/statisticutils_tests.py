import unittest

from mock import Mock, patch
import pandas as pd


import superset.statistics_utility as stats


class StatsUtilTestCase(unittest.TestCase):
    # def test_constructor_exception_no_datasource(self):
    #     xData = [1,2,3]
    #     yData = [4,5,6]
    #     datasource = None
    #     exception = "Array X, Y must be of equal lengths"
    #     self.assertRaises(exception,stats.linear_regression(datasource,datasource))
    def test_with_valid_inputs(self):
        xData = [1,2,3]
        yData = [4,5,6]
        test = stats.linear_regression(xData,yData)
        results = {
            'slope'     :1.0,
            'intercept' :3.0,
            'r_value'   :1.0,
            'p_value'   :9.0031631615710586e-11,
            'std_err'   :0.0
        }

        self.assertEquals(results, test)