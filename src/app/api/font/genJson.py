#%%
import requests
import json
import itertools

# %%
base_data = requests.get("https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/google-fonts-v2.json").json()
variable_data = requests.get("https://raw.githubusercontent.com/fontsource/google-font-metadata/main/data/variable.json").json()

# %%
font_info = [
    {"category": i["category"], "value": i["family"]}
    for i in base_data.values()
]
# %%
with open("../../editor/fontInfo.json", "w") as f:
    json.dump(font_info, f)
# %%

loader_strs = {}
for font in base_data.values():
    loader_strs[font["family"]] = "ital,wght@" + ";".join(
        f"{'1' if style == 'italic' else '0'},{weight}"
        for style, weight in
        itertools.product(font["styles"], font["weights"])
    )

# %%
for font in variable_data.values():
    sorted_axes = sorted(font["axes"].keys(), key=lambda x: x.swapcase())
    val = ",".join(sorted_axes) + "@"
    if "ital" in sorted_axes:
        val += ",".join(f"{'0' if axis == 'ital' else str(font['axes'][axis]['min'] + '..' + font['axes'][axis]['max'])}" for axis in sorted_axes)
        val += ";"
        val += ",".join(f"{'1' if axis == 'ital' else str(font['axes'][axis]['min'] + '..' + font['axes'][axis]['max'])}" for axis in sorted_axes)
    else:
        val += ",".join(f"{font['axes'][axis]['min']}..{font['axes'][axis]['max']}" for axis in sorted_axes)
    loader_strs[font["family"]] = val

# %%
with open("loader_strs.json", "w") as f:
    json.dump(loader_strs, f)
# %%
