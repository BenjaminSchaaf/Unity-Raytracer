Note by Charleston314: I am currently porting this code to C# to be compatible for the latest Unity version.

#Unity Raytraced Renderer
===
##Usage
Just by simple attaching this script to any camera, the raytraced renderer will perform it's magic,
It is however noteworthy that this was made in Unity 4 and backwards comppatability is not guaranteed.
This works in both indie and pro, with all features, no ristrictions.
All Textures that are to be rendered must have `Read/Write Enabled` Enabled

##Settings
I will briefly explain each setting of the script

`Real Time` Simple enough, if you want the renderer to do more than 1 render, check this

`AutoGenerateColliders` Unless you've read the code and know what this dies, keep this one on

`Smooth Edges` This will make round edges seem rounf and not jagged. It does however decrease performance quite a bit.

`Single material Only` If your meshes have more than 1 material, and you want them to render, tick this, otherwise it's just a performance boost ;)

`Use Lighting` Without this everything will be rendered as if it was completely lit on all sides.

`Resolution` The multiplyer of the resolution to render at. If you have a `100x100` display and it is at `0.1`, it will render at `10x10`. At `2.0` it will render at `200x200`.

`Max Stack` The maximum number of recursive steps to take. Good numbers: 5-20

##Rights
Note that this is a community project. Any commits are welcome! Any feedback is welcome.
I do not care about credit. Tell your friends you made this for all I care :P
Also note that this was started by me: Benproductions1

##Contact
If anyone has any questions/comments/remarks feel free to do so on the unity forums page for this project here:
http://forum.unity3d.com/showthread.php?175212
