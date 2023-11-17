def flatten_object(d, parent_key="", sep="."):
    items = {}
    if isinstance(d, list):
        for idx, val in enumerate(d):
            new_key = f"{parent_key}{sep}{idx}" if parent_key else str(idx)
            if isinstance(val, (dict, list)):
                items.update(flatten_object(val, new_key, sep=sep))
            else:
                items[new_key] = val
    else:
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, (dict, list)):
                items.update(flatten_object(v, new_key, sep=sep))
            else:
                items[new_key] = v
    return items


def sort_object(obj):
    sorted_obj = dict(sorted(obj.items(), key=lambda kv: (kv[0], str(kv[1]))))
    return sorted_obj


# Example Usage
obj = {
    "city": "Stockholm",
    "coords": {"lat": 59.331924, "long": 18.062297},
    "measurements": [
        {
            "time": 1624363200,
            "temp": {"val": 28, "unit": "C"},
            "wind": {"val": 2.8, "dir": 290, "unit": "m/s"},
        },
        {"time": 1624366800, "temp": {"val": 26, "unit": "C"}},
    ],
}

flattened = flatten_object(obj)
sorted_dict = sort_object(flattened)

# valid JSON requires double quotes as per specification
print(str(sorted_dict).replace("'", '"'))
