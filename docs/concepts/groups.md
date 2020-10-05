# Groups

### What is a Group and why should I care

Groups are a way to give structure to your scene and make it easier to apply materials and kinematics.

Typically CAD and other forms of 3D data do not have a hierarchy that necessarily aligns with the goals of your current project. Groups can be used to organize data in the scene so it becomes easier to work with.


#### Using groups to assign materials

A typical use case is to assign all relevant items to a group, and then simply assign a material to the group. this means that if you need to change the material, you can simply re-assign a new material to the group.


#### Using groups to control movement

Imaging you have a colection of geometries that are intended to move together. e.g. a plastic casing with a collection of metal screws. You can create a group that contains the casing and screws, and then move the group using a kinematic operator like the gears or explode operator.

#### Using groups to control cutaways

Groups are the primary way to enable and disable cutaways and control the cutting plane.

```javascript
```

