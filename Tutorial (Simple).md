Building a RayTracer in Unity
=============================
##Intro
Hello, and again, welcome to the â€œBuilding a RayTracer in Unityâ€ tutorial.
Here are a couple things you should probably know:

- Everything will be statically typed... even function
- I will post the full script after every chapter
- This is made in Unity 4 indie. I have no guarantees it will work anywhere else
- If at any time during this tutorial you get lost on something, please take the time to look it up, before you ask me
- If you do not feel comfortable doing some basic programing, please learn before you come here :)

Note that throughout this tutorial I am assuming that you are already aware of the basics behind raytracing.I also assume you have basic knowledge in programming in Unityscript.  
Note that I will not teach you scripting, nor will I answer any questions related to basic scripting problems, as there are enough tutorials out there that already do that. I am solely focusing on Raytracing in Unity.

##Part 1: Black and White
The very first thing we should get working, is just getting unity to render something on the screen. For the time being, we are not going to worry what we are rendering, but more on how we are going to render it.

Lets begin with the start of the script: Defining the variables.  
The Only variable we need as of yet is the texture we want to render too  
This textur emust be of type `Texture2D` as this is the only texture type which allows reading and writing.
```javascript
private var renderTexture:Texture2D;
```

Now we must also create a new texture and assign it to our new variable  
We should do this in the `Awake` function, as this is the earliest point where we have access to the screen height
```javascript
//Create render texture with screen size
function Awake():void {
  renderTexture = new Texture2D(Screen.height, Screen.width);
}
```

Now that we have the foundations, lets write the function that will do 1 full render  
We should split this "render" into 2 parts, as we will need the other part later  
Lets start with a function that loops through all the pixels  

```javascript
//The function that renders the entire scene to a texture
function RayTrace():void {
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x, y, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    //We also need to apply the changes we have made to the texture
    //This is a part that can cause much pain and frustraction if forgotten
    //So don't forget ;)
    renderTexture.Apply();
}
```

Next thing we have to do is get the rendering that's done for each pixel down.  
To do this I will be using the inbuilt `Raycast` function.  
I assume you already know how to use this function.  
For now all we want to do is find out if at the current pixel there is or isn't an object.  
In the first case, we will return white else black. It's that simple.

```javascript
//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	
	if (Physics.Raycast(ray)) {
		return Color.white;
	}
	
	return Color.black;
}
```

Before we can test what we have written though, we need to actually display the texture on the screen.  
I preffer always doing this with `GUI` elements, specifically `DrawTexture` as it fits perfectly  
We also have to call our `RayTrace` function. Lets put it in `Start` for now

```javascript
function Start():void {
	RayTrace();
}

//Draw the render
function OnGUI():void {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}
```

Now we have a "working" raytracer. If we open up a new scene, place a couple of objects with colliders attached, attach our script to the camera and run it, we will see exactly what we had hoped for, Black and White:

![ScreenShot](http://db.tt/HbHYumol)

Thats it for part 1, here is the code so far:
```javascript
private var renderTexture:Texture2D;

//Create render texture with screen size
function Awake() {
	renderTexture = new Texture2D(Screen.width, Screen.height);
}

//Do one raytrace when we start playing
function Start() {
	RayTrace();
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x, y, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	
	if (Physics.Raycast(ray)) {
		return Color.white;
	}
	
	return Color.black;
}
```

##Part 1.5: Additional Features
As you might have noticed, it takes Unity some time to even render a simple scene with the code so far. It is certainly not a good idea to try and do this in real time, unless we change the resolution.  
I thought it might be a good Idea to add in some special features with this raytracer, more specifically the ability to render "real-time" and also the ability to "set" the resolution.  
Honestly features you should be able to add yourself, but I'll do it anyway.  
This will be a quite short part, but I will go over quickly adding these small features:


First we need to add 2 more variables, ones accessible to the user:

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;
```

Lets first make the nessesary changes for adding real time:

```javascript
//In Start we only render if we are not real time
function Start() {
	if (!RealTime) {
    	RayTrace();
    }
}

//In the new Update, we only render if we are real time
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}
```

Now lets change the `renderTexture` depending on the resolution we set,  
As well as cast the ray inversly relative to the resolution

```javascript
//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Now in our nested for loops
var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
```

Now that we've added these simple features, lets move on to part 2  
And as always, heres all the code:

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
	if (!RealTime) {
    	RayTrace();
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	
	if (Physics.Raycast(ray)) {
		return Color.white;
	}
	
	return Color.black;
}
```

##Part 2: Colors and Textures
How about we now move away from just rendering black and white and let's use the color of the material of whatever we hit.
The Main thing we are going to work on from now on, is going to be our `TraceRay` function, so assume from now on all code is written in there unless specifically stated otherwise:

```javascript
//We fist have to create the hit variable
var hit:RaycastHit;

//Now we parse it in as another argument
if (Physics.Raycast(ray, hit)) {
	//now we can get all kinds of information out of the "hit"
    //like hit.distance, hit.point, all of which will be usefull later on
}

return Color.black;
```

Next we should get the material we hit, then get it's color and return it:

```javascript
var hit:RaycastHit;
if (Physics.Raycast(ray, hit)) {
	
    //Create a temporary reference variable (useful later on)
    var mat:Material;
    
    //Get the material attached to the renderer of the collider we hit
    //if we used hit.transform instead, we would encounter bugs with rigidbodys
    //so we use collider
	mat = hit.collider.renderer.material;
    
    //return the main color of that material
    return mat.color;
    
}
return Color.black;
```

Congratulations, if we now make different materials for the objects and assign them different colours, our raytraced renderer will properly shade them.  
But just shading is quite boring. How about we add texturing while we're at it?
One of the awesome things about Unity Raycasting, is that the raycast hit also returns a UV coordinate.  
This makes it very simple for us to also add texturing:

```javascript
var hit:RaycastHit;

if (Physics.Raycast(ray, hit)) {
	var mat:Material;
	mat = hit.collider.renderer.material;
    
  	//if the material has a texture
  	if (mat.mainTexture) {
    	//return the color of the pixel at the pixel coordinate of the hit
    	return (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
  	}
  	else {
     	//return the material color
      	return mat.color;
  	}
}
return Color.black;
```

One note to make, is that this will only work if the texture of that material is read-write accessible.  
This can be set in the import options of that texture.  
Another note, is that to get the texture coordinates, you have to have a `MeshCollider` on the object.  
When looking at this, and thinking about the things we want to add later, it seems like it will be quite a pain (and a lot of `if` statements) for all possible values of the return color.
Instead of doing what we are doing right now, lets make our lives easier and have 1 color we change throught that function?

```javascript
//The color this function will return
var returnColor:Color = Color.black;

var hit:RaycastHit;

if (Physics.Raycast(ray, hit)) {
	var mat:Material;
	mat = hit.collider.renderer.material;
    
  	//Instead of returning or settings the color, we simply add the color
  	if (mat.mainTexture) {
    	returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
  	}
  	else {
      	returnColor += mat.color;
  	}
}

//At the end, we simple return the color
return returnColor
```

Yay! We now have textured and shaded objects.  
Lets see what it looks like so far?  

![ScreenShot](http://db.tt/v63jXgat)

Before we begin to add lighting, as promised, I will paste the full code again

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
	if (!RealTime) {
    	RayTrace();
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	//The color we change throught the function
	var returnColor:Color = Color.black;
	
	var hit:RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		
	    //The material of the object we hit
	    var mat:Material;
	    
	    //Set the used material
	    mat = hit.collider.renderer.material;
	    
	    //if the material has a texture
		if (mat.mainTexture) {
			//return the color of the pixel at the pixel coordinate of the hit
			returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
		}
		else {
			//return the material color
			returnColor += mat.color;
		}
	}
	
	//The color of this pixel
	return returnColor;
}
```

##Part 3: Finally some Light

A very important part in any Raytraced renderer is always the way it handles light.  
In this part I will go over the basics of implementing directional lighting in our renderer.  

To do this, we need a function that asseses the light color, given a certain point.  
The first major information we need for this, are all the lights in the scene.  
For optimisation purposes, we will only do a full search for all lights before we render:

```javascript
//We create a new variable to hold all lights
private var lights:Light[];

//In our RayTrace Function
//We find all lights
function RayTrace():void {
	lights = FindSceneObjectsOfType(typeof(Light)) as Light[];
}
```

Now that we have access to all the lights, we begin writing the function to assess the lighting at a certain point.  
Just for nicer looking code, we should break this up into 2 functions.  

```javascript
//Trace a single point for all lights
function TraceLight(pos:Vector3):Color {
	//We set the starting light to that of the render settings ambient light
    //This makes it easier to predict how it will look when we render it
	var returnColor:Color = RenderSettings.ambientLight;
	
    //We loop through all the lights and perform a light addition with each
	for (var light:Light in lights) {
		if (light.enabled) {
        	//Add the light that this light source casts to the color of this point
			returnColor += LightTrace(light, pos);
		}
	}
	
    //return the color of this point according to lighting
	return returnColor;
}

//Trace a single point for a single light
function LightTrace(light:Light, pos:Vector3):Color {
	//Only trace if it's a directional light
	if (light.type == LightType.Directional) {
    	
        /*
        This needs some explaining:
        All we do here, is cast a ray indefinately in the opposite direction
        Of the way the directional light is facing. If this ray hits an object, it means
        that no light is recieved from this light source at this point,
        so we return black.
        If this ray doesn not hit, it means this point is recieving light from this light source
        so we return the color of the light, multiplied by it's intensity
        */
		if (Physics.Raycast(pos, -light.transform.forward)) {
			return Color.black;
		}
		return light.color*light.intensity;
	}
}
```

Before we can test this, we also need to add the `TraceLight` function into our `TraceRay` calculation, so that we take into account lighting for every point we hit.  
This is a relatively easy part, all we have to do is multiply the `returnColor` by the "light" at that point:

```javascript
//After we apply the material color
//We apply lighting
returnColor *= TraceLight(hit.point);
```

And thats it! We now have shadows.  

![ScreenShot](http://db.tt/Uz95LMVd)

As you probably have noticed while playing around with the directional lighting we now have,  
That there is one major problem with this: White error spots...

The problem is that we are tracing the light from the exact point on the surface.  
Due to inaccuracies of raycasting (due to floating point precision) there is no guarantee that the ray will intersect with the surface if it originates from it.  
The only way to counter this problem, is to trace our light from a point very slightly off the surface, using the normal:

```javascript
//Instead of just tracing from the point
//we add a small value of the hit normal to it
returnColor *= TraceLight(hit.point + hit.normal*0.0001);
```

This tiny little change will make all the difference.

![ScreenShot](http://db.tt/4d86Kqfq)

And here is all the code so far:

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;
private var lights:Light[];

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
	if (!RealTime) {
    	RayTrace();
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	//Gather all lights
	lights = FindSceneObjectsOfType(typeof(Light)) as Light[];
	
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	//The color we change throught the function
	var returnColor:Color = Color.black;
	
	var hit:RaycastHit;
	
	if (Physics.Raycast(ray, hit)) {
		
	    //The material of the object we hit
	    var mat:Material;
	    
	    //Set the used material
	    mat = hit.collider.renderer.material;
	    
	    //if the material has a texture
		if (mat.mainTexture) {
			//return the color of the pixel at the pixel coordinate of the hit
			returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
		}
		else {
			//return the material color
			returnColor += mat.color;
		}
		
		returnColor *= TraceLight(hit.point + hit.normal*0.0001);
	}
	
	//The color of this pixel
	return returnColor;
}

//Trace a single point for all lights
function TraceLight(pos:Vector3):Color {
	//Set starting light to that of the render settings
	var returnColor:Color = RenderSettings.ambientLight;
	
    //We loop through all the lights and perform a light addition with each
	for (var light:Light in lights) {
		if (light.enabled) {
        	//Add the light that this light source casts to the color of this point
			returnColor += LightTrace(light, pos);
		}
	}
	return returnColor;
}

//Trace a single point for a single light
function LightTrace(light:Light, pos:Vector3):Color {
	//Trace the directional light
	if (light.type == LightType.Directional) {
		if (Physics.Raycast(pos, -light.transform.forward)) {
			return Color.black;
		}
		return light.color*light.intensity;
	}
}
```

##Part 4: Automatic Collision Setup

So far we have always relied on whoever set up the scene to have put mesh colliders on everything.  
We have also been relying on there not being any functionality besides our renderer.  
The problem is in some cases, we just want to throw some things in the scene, run it and have it work.  

This part has nothing to do with raytracing, but it will make your life easier later on.  
Feel free to just skip to the end and copy the code.

What we need to do is add our own colliders to all the objects in the scene.  
Put these colliders on a different layer (so they don't effect anything).  
And then only raycast this layer.  

Lets start by writing the function that does this automatically:

```javascript
function GenerateColliders():void {
	
	//Loop through all mesh filters
	for (var mf:MeshFilter in FindSceneObjectsOfType(typeof MeshFilter) as MeshFilter[]) {
    	
    	//Only if they have a MeshRenderer attached
        //They might not... who knows?
        if (mf.GetComponent(MeshRenderer)) {
        	//Create a new object we will use for rendering
        	var tmpGO:GameObject = GameObject("RTRMeshRenderer");
            
            //Add the Collider with the same mesh as the MeshFilter
            tmpGO.AddComponent(MeshCollider).sharedMesh = mf.mesh;
            
            //Make it a child of the MeshFilter
            tmpGO.transform.parent = mf.transform;
            
            //Make this new object the same dimentions as the meshFilter
            tmpGO.transform.localPosition = Vector3.zero;
            tmpGO.transform.localScale = Vector3.one;
            tmpGO.transform.localRotation = Quaternion.identity;
            
            //Make it a trigger (to avoid Physx)
            tmpGO.collider.isTrigger = true;
            
            //Set it's layer
            tmpGO.layer = 31;
        }
    }
}
```

We then have to make the changes so that we only raycast that layer, and we also generate the coliders when we `Start`.

```javascript
//Collision Mask
private var collisionMask:LayerMask = 1 << 31;

function Start() {
	//Generate Colliders for all objects
    GenerateColliders();
    
    if (!RealTime) {
    	RayTrace();
    }
}

//In the TraceRay Function
if (Physics.Raycast(ray, hit, collisionMask)) {
//Also we need to access the parent of the object to be able to get rendering information
mat = hit.collider.transform.parent.renderer.material;

//In the LightTrace function
if (Physics.Raycast(pos, -light.transform.forward, collisionMask)) {
```

And there we have it! Automatic collider setup. Now we can even run physics with no problems!

As always, here is the complete code:

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;
private var lights:Light[];

//Collision Mask
private var collisionMask:LayerMask = 1 << 31;

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
    GenerateColliders();
	
	if (!RealTime) {
    	RayTrace();
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	//Gather all lights
	lights = FindSceneObjectsOfType(typeof(Light)) as Light[];
	
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	//The color we change throught the function
	var returnColor:Color = Color.black;
	
	var hit:RaycastHit;
	
	if (Physics.Raycast(ray, hit, Mathf.Infinity, collisionMask)) {
		
	    //The material of the object we hit
	    var mat:Material;
	    
	    //Set the used material
	    mat = hit.collider.transform.parent.renderer.material;
	    
	    //if the material has a texture
		if (mat.mainTexture) {
			//return the color of the pixel at the pixel coordinate of the hit
			returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
		}
		else {
			//return the material color
			returnColor += mat.color;
		}
		
		returnColor *= TraceLight(hit.point + hit.normal*0.0001);
	}
	
	//The color of this pixel
	return returnColor;
}

//Trace a single point for all lights
function TraceLight(pos:Vector3):Color {
	//Set starting light to that of the render settings
	var returnColor:Color = RenderSettings.ambientLight;
	
    //We loop through all the lights and perform a light addition with each
	for (var light:Light in lights) {
		if (light.enabled) {
        	//Add the light that this light source casts to the color of this point
			returnColor += LightTrace(light, pos);
		}
	}
	return returnColor;
}

//Trace a single point for a single light
function LightTrace(light:Light, pos:Vector3):Color {
	//Trace the directional light
	if (light.type == LightType.Directional) {
		if (Physics.Raycast(pos, -light.transform.forward, Mathf.Infinity, collisionMask)) {
			return Color.black;
		}
		return light.color*light.intensity;
	}
}

//Generate colliders for all objects
function GenerateColliders():void {
	//Loop through all mesh filters
	for (var mf:MeshFilter in FindSceneObjectsOfType(typeof MeshFilter) as MeshFilter[]) {
        if (mf.GetComponent(MeshRenderer)) {
        	//Create a new object we will use for rendering
        	//And make it the same as the MeshFilter
        	var tmpGO:GameObject = GameObject("RTRMeshRenderer");
            tmpGO.AddComponent(MeshCollider).sharedMesh = mf.mesh;
            tmpGO.transform.parent = mf.transform;
            tmpGO.transform.localPosition = Vector3.zero;
            tmpGO.transform.localScale = Vector3.one;
            tmpGO.transform.localRotation = Quaternion.identity;
            
            tmpGO.collider.isTrigger = true;
            tmpGO.layer = 31;
        }
    }
}
```

##Pasrt 5: Shading with normals

As you might have noticed, when we render something like a sphere,  
we have some obvious differences between how Unity renders it, and how we render it.  
The main difference is, that Unity determines the light at a point depending on the Normal of that surface.  

The way we can determine a multiplyer of our light color at that point, is by looking at a "dot product"

A "Dot Product" is a mathamatical function, that allows us to determin the relationship between 2 directional vectors.  
Lets say we have 2 vectors that are equal. The dot product would equal 1. If they are perpendicular, it's 0. And if they are opposite, the dot product is -1.
As you have probably noticed, this is exactly what we need, but it is also an optimisation, as we do not need to calculate lighting, if the dot product is negative.
The way a dot product is calculated in Unity, is by using the inbuilt `Vector3` function: `Dot`.  

The first thing we need to do is parse both our lighting functions, the normal of the raycast hit:

```javascript
//In TraceRay
returnColor *= TraceLight(hit.point + hit.normal*0.0001, hit.normal);

function TraceLight(pos:Vector3, normal:Vector3):Color {
	//When we call the other function:
    returnColor += LightTrace(light, pos, normal);

function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
```

In our `LightTrace` function, we can then calculate the dot and act accordingly:

```javascript
//Trace the directional light
if (light.type == LightType.Directional) {
	//calculate the dot product
	var dot:float = Vector3.Dot(-light.transform.forward, normal);
    
    //only perform lighting calculations, if the dot is more than 0
    if (dot > 0) {
		if (Physics.Raycast(pos, -light.transform.forward, Mathf.Infinity, collisionMask)) {
			return Color.black;
		}
        
        //return the color multiplied by the dot
        return light.color*light.intensity*dot;
    }
    //the face is facing away from the light, so no light is on it
	return Color.black;
}
```

After running this you might think: Hey... it's an improvement... but now everything looks kind of blocky.  
AKA there is no smoothness in along the edges of the triangles that make a sphere.  

What you are reffering to is called Normal Interpolation. It's a very complex, computationally expensive calculation, that interpolates between the normals in a triangle to produce smooth looking surfaces.  
Most likely I will not be going over that in this tutorial, because of it's complexity. If you want an implementation of it, fell free to look at the github repository of my own Raytracer I built before making this tutorial.  

Now we have proper (fast) normal shading, isn't it awesome!?

![ScreenShot](http://db.tt/UmDHFr05)

And now the code.... again...

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;
private var lights:Light[];

//Collision Mask
private var collisionMask:LayerMask = 1 << 31;

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
    GenerateColliders();
	
	if (!RealTime) {
    	RayTrace();
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	//Gather all lights
	lights = FindSceneObjectsOfType(typeof(Light)) as Light[];
	
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	//The color we change throught the function
	var returnColor:Color = Color.black;
	
	var hit:RaycastHit;
	
	if (Physics.Raycast(ray, hit, Mathf.Infinity, collisionMask)) {
		
	    //The material of the object we hit
	    var mat:Material;
	    
	    //Set the used material
	    mat = hit.collider.transform.parent.renderer.material;
	    
	    //if the material has a texture
		if (mat.mainTexture) {
			//return the color of the pixel at the pixel coordinate of the hit
			returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
		}
		else {
			//return the material color
			returnColor += mat.color;
		}
		
		returnColor *= TraceLight(hit.point + hit.normal*0.0001, hit.normal);
	}
	
	//The color of this pixel
	return returnColor;
}

//Trace a single point for all lights
function TraceLight(pos:Vector3, normal:Vector3):Color {
	//Set starting light to that of the render settings
	var returnColor:Color = RenderSettings.ambientLight;
	
    //We loop through all the lights and perform a light addition with each
	for (var light:Light in lights) {
		if (light.enabled) {
        	//Add the light that this light source casts to the color of this point
			returnColor += LightTrace(light, pos, normal);
		}
	}
	return returnColor;
}

//Trace a single point for a single light
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	//Trace the directional light
	if (light.type == LightType.Directional) {
		//calculate the dot product
		var dot:float = Vector3.Dot(-light.transform.forward, normal);
	    
	    //only perform lighting calculations, if the dot is more than 0
	    if (dot > 0) {
			if (Physics.Raycast(pos, -light.transform.forward, Mathf.Infinity, collisionMask)) {
				return Color.black;
			}
	        
	        return light.color*light.intensity*dot;
	    }
		return Color.black;
	}
}

//Generate colliders for all objects
function GenerateColliders():void {
	//Loop through all mesh filters
	for (var mf:MeshFilter in FindSceneObjectsOfType(typeof MeshFilter) as MeshFilter[]) {
        if (mf.GetComponent(MeshRenderer)) {
        	//Create a new object we will use for rendering
        	//And make it the same as the MeshFilter
        	var tmpGO:GameObject = GameObject("RTRMeshRenderer");
            tmpGO.AddComponent(MeshCollider).sharedMesh = mf.mesh;
            tmpGO.transform.parent = mf.transform;
            tmpGO.transform.localPosition = Vector3.zero;
            tmpGO.transform.localScale = Vector3.one;
            tmpGO.transform.localRotation = Quaternion.identity;
            
            tmpGO.collider.isTrigger = true;
            tmpGO.layer = 31;
        }
    }
}
```

##Part 6: More Lighting

So now we have a raytracer that can do many things, but there are some key aspects that we have missed.  
More specifically the different types of lights Unity offers.  

In this part, I will be going over how to add Point and Spot light support into the Raytracer.  
Note that in this part all code will be in the `LigthTrace` function.

Lets start with Point as it's easier.  
###Point Lights
First we have to consider all the aspects of a point light: 

- Range
- Intensity
- Color

Intensity and Color we have already implemented sucessfully in our Directional lighting, but Range adds a whole new consept.
No longer will we have either a light at full brightness or in the shadow, but interpolation between fully bright and in the shadows.
We also have to consider that our Raycast can not be infinite, because the light source has an origin, unlike a directional light.

Lets start by calculating the distance from our point to the light.  
Because both point and spot are so similar, I will make some optimisations for each.

```javascript
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	if (light.type == LightType.Directional) {
	}
    else {
    	//calculate the distance between our point and the light
    	var distance:float = Vector3.Distance(pos, light.transform.position);
        
        //No matter if the light is point or spot, it still has a range and we account for that
        if (distance < light.range) {
        	
            //Now we have to check for which type of light it is
    		if (light.type == LightType.Point) {
            }
        }
        
        //we are outside of the lights range, so no need for light
        return Color.black;
    }
}
```

While we are at it, lets also account for the new normal shading, which is again the same for both light types.  
As an optimisation I will create 2 new variables as we will need both later.

```javascript
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	//Because we have already defined dot in here, we should define it at the top of our funstion and only use it inside
    //If you do not do this, you will recieve errors
    var dot:float;
    
	if (light.type == LightType.Directional) {
    	//We also need to change this line, to remove errors it would generate
    	dot = Vector3.Dot(-light.transform.forward, normal);
	}
    else {
    	//Lets calculate the direction from our point, to the light.
        //we will need this for both the normal shading and also shadow checking
    	var direction:Vector3 = (light.transform.position - pos).normalized;
        
        //Now we calculate the dot product of the direction and the normal.
    	dot = Vector3.Dot(normal, direction);
    	
    	var distance:float = Vector3.Distance(pos, light.transform.position);
        
        //We also check if our dot is larger than 0 here
        if (distance < light.range && dot > 0) {
    		if (light.type == LightType.Point) {
            }
        }
        return Color.black;
    }
}
```

Now we move on to the logic behind what color to return:  
It's acctually quite simple.
If a raycast from our point, in the direction we calculated, with the maximum distance we calculated hit's anything, we return black as usual.
Else we return the color of the light multiplied by it's intensity and by the dot (as per usual), but then we also multiply it by the percentage of distance we are from the light source origin.

If you don't understand it, I don't blame you... Heres the formula for our new multiplier: `1 - light.range/distance`.

So all we have to do is:

```javascript
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	if (light.type == LightType.Directional) {
	}
    else {
    	var direction:Vector3 = (light.transform.position - pos).normalized;
    	dot = Vector3.Dot(normal, direction);
    	var distance:float = Vector3.Distance(pos, light.transform.position);
        if (distance < light.range && dot > 0) {
    		if (light.type == LightType.Point) {
            	//Raycast as we described
                if (Physics.Raycast(pos, direction, distance, collisionMask)) {
                	return Color.black;
                }
                
                //Amd then our new formula
                return light.color*light.intensity*dot*(1 - light.range/distance);
                
            }
        }
        return Color.black;
    }
}
```

And there we have it... we now have working point lights!

###Spot Lights

Lets do this in the same fassion that we did with point lights.  
Fist lets consider all aspects of a spot light:

- Spot Angle
- Range
- Intensity
- Color

Like before we have 1 new thing to work on. Although it might not be exactly the same way Unity does it, but let's consider a spot light to be a point light, where there is a limited angle of exposure. This means, that the dot product of the direction to the light source and the backward direction of the light must be smaller than the Spot angle transformed in some way.  
If we consider that dot product would range from 1 to 0 with 180 degrees of the lights forward direction.  
Therefore, the point is within the spot light, if the `dot > 1 - light.spotAngle/180`.

But just finding weather or not the point is within the spot is not enough. We also have to interpolate between the edge of the spot angle and the dot. So as well as considering distance when we calculate the color, we have a new multiplier: `(dot/(1 - light.spotAngle/180))`

Lets implement this. As we already have most of the information present, this should be easy:

```javascript
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	if (light.type == LightType.Directional) {
	}
    else {
        if (distance < light.range && dot > 0) {
    		if (light.type == LightType.Point) {
            }
            //Lets check weather we are in the spot or not
            else if (light.type == LightType.Spot) {
            	//Get the dot product between the backwards direction of the light and our direction to it
            	var dot2:float = Vector3.Dot(-light.transform.forward, normal);
                
                //Only do spot lighting if we are within the spot light
            	if (dot2 < (1 - light.spotAngle/180)) {
	                if (Physics.Raycast(pos, direction, distance, collisionMask)) {
	                	return Color.black;
	                }
	                
	                //We multiply by the multiplier we defined above
	                return light.color*light.intensity*dot*(1 - light.range/distance)*((dot2/(1 - light.spotAngle/180)));
            	}
            }
        }
        return Color.black;
    }
}
```

And there we go! We now have working spot lights. They don't work in quite the same way as the ones in Unity, but at least they are spot lights.

Lets look at both of them in action:

![ScreenShot](http://db.tt/uI4mSUXA)

On that note, here is also the current code:

```javascript
//weather or not to render in real time
var RealTime:boolean = false;

//How much of our screen resolution we render at
var RenderResolution:float = 1;

private var renderTexture:Texture2D;
private var lights:Light[];

//Collision Mask
private var collisionMask:LayerMask = 1 << 31;

//Create render texture with screen size with resolution
function Awake() {
	renderTexture = new Texture2D(Screen.width*RenderResolution, Screen.height*RenderResolution);
}

//Do one raytrace when we start playing
function Start() {
    GenerateColliders();
	
	if (!RealTime) {
    	RayTrace();
    	RTRenderer.SaveTextureToFile(renderTexture, "lolies.png");
    }
}

//Real Time Rendering
function Update() {
	if (RealTime) {
    	RayTrace();
    }
}

//Draw the render
function OnGUI() {
	GUI.DrawTexture(Rect(0, 0, Screen.width, Screen.height), renderTexture);
}

//The function that renders the entire scene to a texture
function RayTrace():void {
	//Gather all lights
	lights = FindSceneObjectsOfType(typeof(Light)) as Light[];
	
	for (var x:int = 0; x < renderTexture.width; x += 1) {
    	for (var y:int = 0; y < renderTexture.height; y += 1) {
        	
        	//Now that we have an x/y value for each pixel, we need to make that into a 3d ray
            //according to the camera we are attached to
            var ray:Ray = camera.ScreenPointToRay(Vector3(x/RenderResolution, y/RenderResolution, 0));
            
            //Now lets call a function with this ray and apply it's return value to the pixel we are on
            //We will define this function afterwards
            renderTexture.SetPixel(x, y, TraceRay(ray));
        }
    }
    
    renderTexture.Apply();
}

//Trace a Ray for a singple point
function TraceRay(ray:Ray):Color {
	//The color we change throught the function
	var returnColor:Color = Color.black;
	
	var hit:RaycastHit;
	
	if (Physics.Raycast(ray, hit, Mathf.Infinity, collisionMask)) {
		
	    //The material of the object we hit
	    var mat:Material;
	    
	    //Set the used material
	    mat = hit.collider.transform.parent.renderer.material;
	    
	    //if the material has a texture
		if (mat.mainTexture) {
			//return the color of the pixel at the pixel coordinate of the hit
			returnColor += (mat.mainTexture as Texture2D).GetPixelBilinear(hit.textureCoord.x, hit.textureCoord.y);
		}
		else {
			//return the material color
			returnColor += mat.color;
		}
		
		returnColor *= TraceLight(hit.point + hit.normal*0.0001, hit.normal);
	}
	
	//The color of this pixel
	return returnColor;
}

//Trace a single point for all lights
function TraceLight(pos:Vector3, normal:Vector3):Color {
	//Set starting light to that of the render settings
	var returnColor:Color = RenderSettings.ambientLight;
	
    //We loop through all the lights and perform a light addition with each
	for (var light:Light in lights) {
		if (light.enabled) {
        	//Add the light that this light source casts to the color of this point
			returnColor += LightTrace(light, pos, normal);
		}
	}
	return returnColor;
}

//Trace a single point for a single light
function LightTrace(light:Light, pos:Vector3, normal:Vector3):Color {
	var dot:float;
	
	//Trace the directional light
	if (light.type == LightType.Directional) {
		//calculate the dot product
		dot = Vector3.Dot(-light.transform.forward, normal);
	    
	    //only perform lighting calculations, if the dot is more than 0
	    if (dot > 0) {
			if (Physics.Raycast(pos, -light.transform.forward, Mathf.Infinity, collisionMask)) {
				return Color.black;
			}
	        
	        return light.color*light.intensity*dot;
	    }
		return Color.black;
	}
 	else {
    	var direction:Vector3 = (light.transform.position - pos).normalized;
    	dot = Vector3.Dot(normal, direction);
    	var distance:float = Vector3.Distance(pos, light.transform.position);
        if (distance < light.range && dot > 0) {
    		if (light.type == LightType.Point) {
            	//Raycast as we described
                if (Physics.Raycast(pos, direction, distance, collisionMask)) {
                	return Color.black;
                }
                return light.color*light.intensity*dot*(1 - distance/light.range);
            }
            //Lets check weather we are in the spot or not
            else if (light.type == LightType.Spot) {
            	var dot2:float = Vector3.Dot(-light.transform.forward, direction);
            	if (dot2 > (1 - light.spotAngle/180)) {
	                if (Physics.Raycast(pos, direction, distance, collisionMask)) {
	                	return Color.black;
	                }
	                
	                //We multiply by the multiplier we defined above
	                return light.color*light.intensity*dot*(1 - distance/light.range)*((dot2/(1 - light.spotAngle/180)));
            	}
            }
        }
        return Color.black;
    }
}

//Generate colliders for all objects
function GenerateColliders():void {
	//Loop through all mesh filters
	for (var mf:MeshFilter in FindSceneObjectsOfType(typeof MeshFilter) as MeshFilter[]) {
        if (mf.GetComponent(MeshRenderer)) {
        	//Create a new object we will use for rendering
        	//And make it the same as the MeshFilter
        	var tmpGO:GameObject = GameObject("RTRMeshRenderer");
            tmpGO.AddComponent(MeshCollider).sharedMesh = mf.mesh;
            tmpGO.transform.parent = mf.transform;
            tmpGO.transform.localPosition = Vector3.zero;
            tmpGO.transform.localScale = Vector3.one;
            tmpGO.transform.localRotation = Quaternion.identity;
            
            tmpGO.collider.isTrigger = true;
            tmpGO.layer = 31;
        }
    }
}
```

##Conclusion

After quite a long time, I have finally finished this tutorial. I hope it was at least of some use to you.  
Although I myself have written a way more advanced Raytraced Renderer than the one I wrote for this tutorial, It was definately fun. If you have any questions, feel free to hit me up on the Unity Forums.

My name is Benproductions1  
Have a nice day

Unity Forums:
http://forum.unity3d.com/members/45364-Benproductions1

My RayTracer:
https://github.com/Benproductions1/Unity-Raytracer
