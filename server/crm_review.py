"""Optional regional CRM workflow review. No automatic qualification or appointment."""
FIELDS = {'tools': 200, 'teamSize': 20, 'challenge': 500, 'integrations': 300}
TEAMS = ('1-5', '6-20', '21-50', '51-plus', 'Not sure')
ROUTES = tuple('/'+market+'/'+route+'/' for market in ('us', 'uk', 'india') for route in ('software-development', 'travel-agency-crm'))


def validate(value, enquiry):
    if (enquiry['type'] != 'contact' or enquiry['source'] not in ROUTES
            or enquiry['interest'] != 'CRM & ERP Package' or not enquiry.get('qualification')
            or not isinstance(value, dict) or set(value) != {'version', *FIELDS}
            or type(value['version']) is not int or value['version'] != 1):
        raise ValueError('Check the CRM workflow review and selected service.')
    result = {'version': 1}
    for key, limit in FIELDS.items():
        text = value[key]
        if (not isinstance(text, str) or len(text) > limit
                or any(ord(c) < 32 and c not in '\n\t' for c in text)):
            raise ValueError('Check the workflow review fields and their length.')
        result[key] = text.strip()
    if not result['tools'] or not result['challenge'] or result['teamSize'] not in TEAMS:
        raise ValueError('Add your current tools, team size and main workflow problem.')
    return result


def summary(value):
    return '\n'.join(('CRM workflow review requested', 'Current tools: '+value['tools'],
                      'Team size: '+value['teamSize'], 'Main workflow problem: '+value['challenge'],
                      'Integrations: '+(value['integrations'] or 'To discuss'),
                      'Review request only; scope, meeting availability and commercial terms require confirmation.'))
