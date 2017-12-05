import logging
from scipy import stats


from flask_babel import lazy_gettext as _


def linear_regression(x,y) :
    logging.debug('linear_regression')
    try :
        if (len(x) != len(y)) :
            # raise Exception(_("Error linear_regression: list x and list y don't match in length"))
            raise Exception(_("Array X, Y must be of equal lengths"))
    except :
        raise Exception("Array X, Y must be of equal lengths")

    try :
        slope, intercept, r_value, p_value, std_err = stats.linregress(x,y)
        linepoints  = lambda xy : map(lambda (d): [(slope * d[0]) + intercept,d[1]] , xy)
        return {
            'slope'     : slope,
            'intercept' : intercept,
            'r_value'   : r_value,
            'p_value'   : p_value,
            'std_err'   : std_err,
            # 'line_pts'  : linepoints
        }
    except :
        raise Exception(_("Error linear_regression calculation"))

    return None
